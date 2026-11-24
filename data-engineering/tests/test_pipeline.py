import unittest

from pipeline.collectors.rss import parse_feed
from pipeline.processors.deduplicate import deduplicate_records
from pipeline.processors.normalize import canonicalize_url, normalize_article
from pipeline.storage import persist_articles


class PipelineTests(unittest.TestCase):
    def test_canonical_url_removes_tracking_and_fragment(self):
        self.assertEqual(canonicalize_url("https://Example.com/story/?utm_source=x&b=2#top"), "https://example.com/story?b=2")

    def test_non_https_url_rejected(self):
        with self.assertRaises(ValueError):
            canonicalize_url("http://example.com/a")

    def test_normalize_preserves_unverified_state(self):
        result = normalize_article({"id":"a1","title":" Test  story ","canonical_url":"https://example.com/a?utm_medium=x","source_id":"feed-1","verification_status":"unverified"}, "2026-11-24T00:00:00Z")
        self.assertEqual(result["title"], "Test story")
        self.assertEqual(result["verification_status"], "unverified")
        self.assertEqual(result["review_state"], "unreviewed")

    def test_duplicate_records_use_canonical_url(self):
        records = [{"canonical_url":"https://example.com/a?utm_source=x","id":"1"},{"canonical_url":"https://example.com/a","id":"2"}]
        self.assertEqual([r["id"] for r in deduplicate_records(records)], ["1"])

    def test_rss_atom_parser_keeps_provenance(self):
        xml = '<feed xmlns="http://www.w3.org/2005/Atom"><entry><title>Release</title><link href="https://example.com/a" rel="alternate"/><updated>2026-11-24T00:00:00Z</updated><summary>Snippet</summary></entry></feed>'
        result = parse_feed(xml, {"id":"pib","name":"PIB","official":True})[0]
        self.assertTrue(result["publisher_official"])
        self.assertEqual(result["verification_status"], "unverified")

    def test_dry_run_never_writes(self):
        self.assertEqual(persist_articles([{"id":"a"}])["written"], 0)


if __name__ == "__main__":
    unittest.main()
