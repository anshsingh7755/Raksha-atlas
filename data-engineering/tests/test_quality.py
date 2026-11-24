import unittest

from pipeline.quality import quality_report


class QualityTests(unittest.TestCase):
    def test_quality_report_counts_duplicates_and_sources(self):
        rows = [
            {"id":"1","title":"A","canonical_url":"https://a.test/","source_id":"s1","ingested_at":"2026-11-24T00:00:00Z","published_at":"2026-11-24T00:00:00Z"},
            {"id":"2","title":"B","canonical_url":"https://a.test/","source_id":"s2","ingested_at":"2026-11-24T00:00:00Z","published_at":"bad"},
        ]
        report = quality_report(rows)
        self.assertEqual(report["duplicate_url_count"], 1)
        self.assertEqual(report["source_coverage"], 2)
        self.assertEqual(report["invalid_publication_dates"], 1)
        self.assertFalse(report["passed"])

    def test_empty_batch_is_valid(self):
        self.assertTrue(quality_report([])["passed"])


if __name__ == "__main__":
    unittest.main()
