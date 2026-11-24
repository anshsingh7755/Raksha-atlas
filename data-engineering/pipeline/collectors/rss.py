"""Small, dependency-free RSS/Atom collector for approved public feeds."""
from __future__ import annotations

import hashlib
import ipaddress
import socket
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from html import unescape
from typing import Any
from urllib.parse import urljoin, urlparse


def _local_name(tag: str) -> str:
    return tag.rsplit("}", 1)[-1].lower()


def _child_text(element: ET.Element, *names: str) -> str:
    wanted = {name.lower() for name in names}
    for child in element.iter():
        if _local_name(child.tag) in wanted and child.text:
            return " ".join(unescape(child.text).split())
    return ""


def _item_link(element: ET.Element) -> str:
    for child in element:
        if _local_name(child.tag) == "link":
            href = child.attrib.get("href", "").strip()
            rel = child.attrib.get("rel", "alternate").lower()
            if href and rel == "alternate":
                return href
            if child.text and child.text.strip():
                return child.text.strip()
    return _child_text(element, "guid", "id")


def _date(value: str) -> str | None:
    if not value:
        return None
    try:
        parsed = parsedate_to_datetime(value)
    except (TypeError, ValueError, OverflowError):
        try:
            parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
        except ValueError:
            return None
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")


def parse_feed(xml_text: str, source: dict[str, Any]) -> list[dict[str, Any]]:
    root = ET.fromstring(xml_text)
    records = []
    for item in root.iter():
        if _local_name(item.tag) not in {"item", "entry"}:
            continue
        title = _child_text(item, "title")[:300]
        url = _item_link(item)
        parsed = urlparse(url)
        if not title or parsed.scheme != "https" or not parsed.hostname:
            continue
        published = _date(_child_text(item, "pubDate", "published", "updated", "date"))
        stable = hashlib.sha256(f"{source['id']}|{url}".encode()).hexdigest()[:32]
        records.append({
            "id": f"py-{stable}",
            "title": title,
            "canonical_url": url,
            "source_id": source["id"],
            "publisher": source.get("name"),
            "summary": _child_text(item, "description", "summary", "content")[:1400],
            "published_at": published,
            "publisher_official": bool(source.get("official")),
            "verification_status": "unverified",
            "review_state": "unreviewed",
            "confidence": "official publisher provenance; claim remains unreviewed" if source.get("official") else "unreviewed discovery lead",
            "language": "en",
            "media_type": "rss",
            "raw_metadata": {"feed_kind": source.get("kind", "rss")},
        })
    return records


def _validate_public_url(url: str) -> None:
    parsed = urlparse(url)
    if parsed.scheme != "https" or not parsed.hostname or parsed.username or parsed.password:
        raise ValueError("Only public HTTPS feed URLs are allowed.")
    host = parsed.hostname.lower()
    if host == "localhost" or host.endswith((".localhost", ".local", ".internal")):
        raise ValueError("Private host blocked.")
    try:
        addresses = [ipaddress.ip_address(host)]
    except ValueError:
        try:
            addresses = [ipaddress.ip_address(row[4][0]) for row in socket.getaddrinfo(host, None, type=socket.SOCK_STREAM)]
        except OSError as exc:
            raise ValueError("Feed host could not be resolved.") from exc
    if not addresses or any(not address.is_global for address in addresses):
        raise ValueError("Private or non-public feed host blocked.")


class _SafeRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, request, fp, code, message, headers, new_url):
        target = urljoin(request.full_url, new_url)
        _validate_public_url(target)
        return super().redirect_request(request, fp, code, message, headers, target)


def collect_rss(source: dict[str, Any], timeout: int = 15) -> list[dict[str, Any]]:
    url = source.get("url", "")
    _validate_public_url(url)
    request = urllib.request.Request(
        url,
        headers={"User-Agent": "RakshaAtlas/1.0 (+public RSS metadata)", "Accept": "application/rss+xml,application/atom+xml,application/xml,text/xml"},
    )
    opener = urllib.request.build_opener(_SafeRedirect())
    try:
        with opener.open(request, timeout=timeout) as response:
            if response.status != 200:
                raise RuntimeError(f"Feed returned HTTP {response.status}")
            payload = response.read(2_000_000)
    except (urllib.error.URLError, TimeoutError) as exc:
        raise RuntimeError(f"Feed request failed: {exc}") from exc
    return parse_feed(payload.decode("utf-8", errors="replace"), source)
