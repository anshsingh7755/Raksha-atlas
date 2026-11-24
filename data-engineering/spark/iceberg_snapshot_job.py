"""Optional Spark-to-Iceberg snapshot job; requires a configured catalog."""
import os
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, year


def main() -> None:
    source = os.environ["RAKSHA_PARQUET_INPUT"]
    target = os.environ["RAKSHA_ICEBERG_TABLE"]
    catalog = os.getenv("ICEBERG_CATALOG", "raksha")
    spark = (
        SparkSession.builder.appName("raksha-atlas-iceberg-snapshot")
        .config("spark.sql.extensions", "org.apache.iceberg.spark.extensions.IcebergSparkSessionExtensions")
        .getOrCreate()
    )
    try:
        frame = spark.read.parquet(source)
        if "canonical_url" in frame.columns:
            frame = frame.dropDuplicates(["canonical_url"])
        if "published_at" in frame.columns:
            frame = frame.withColumn("published_year", year(col("published_at")))
        frame.writeTo(f"{catalog}.{target}").using("iceberg").createOrReplace()
    finally:
        spark.stop()


if __name__ == "__main__":
    main()
