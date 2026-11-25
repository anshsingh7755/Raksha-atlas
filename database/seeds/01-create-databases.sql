SELECT 'CREATE DATABASE defence_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'defence_db')
\gexec

SELECT 'CREATE DATABASE application_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'application_db')
\gexec
