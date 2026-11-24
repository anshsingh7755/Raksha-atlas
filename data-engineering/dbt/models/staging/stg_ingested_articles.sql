select
    id,
    title,
    canonical_url,
    source_id,
    publisher,
    summary,
    published_at,
    ingested_at,
    publisher_official,
    verification_status,
    review_state,
    confidence,
    language,
    media_type
from {{ source('raksha', 'ingested_articles') }}
where id is not null
  and canonical_url is not null
  and source_id is not null
