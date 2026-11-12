# Connection String Builder Specification

Route: `/helpers/connection-string`

## Problem Statement

Writing database connection URIs by hand is error-prone: special characters in passwords break parsing, and common parameters (like `sslmode`) are easy to forget or misspell. Developers need a safe, form-based builder that never sends credentials anywhere.

## Goals

- [x] Produce a valid URI for every supported engine with correctly percent-encoded credentials.
- [x] Credentials never leave the browser and are never persisted.

## Out of Scope

| Feature                                        | Reason                    |
| ---------------------------------------------- | ------------------------- |
| Parsing an existing URI into fields            | Deferred to M2            |
| Non-URI formats (JDBC, ADO.NET, ODBC, libpq key-value, TNS descriptor) | v1 builds URI only; deferred to M2 |
| Testing the connection                         | Requires backend          |
| Engines beyond the 7 listed                    | YAGNI for v1; engine definitions are extensible |

## Supported Engines (URI only)

| Engine     | Scheme(s)                               | Default port      | Reference syntax |
| ---------- | --------------------------------------- | ----------------- | ---------------- |
| PostgreSQL | `postgresql://`                         | 5432              | libpq connection URI |
| MySQL      | `mysql://`                              | 3306              | MySQL connection URI (Connector/J, mysqlsh, X DevAPI) |
| MongoDB    | `mongodb://`, `mongodb+srv://`          | 27017 (none in SRV) | MongoDB Connection String URI |
| Redis      | `redis://`, `rediss://` (TLS)           | 6379              | IANA `redis` URI scheme |
| Oracle     | EZConnect Plus: `tcp://`, `tcps://` (TLS) | 1521 (2484 TLS) | Oracle Easy Connect Plus (19c+) |
| ClickHouse | `clickhouse://` (native protocol)       | 9000 (9440 secure) | clickhouse-client / clickhouse-go DSN |
| SQL Server | `sqlserver://`                          | 1433              | Microsoft `go-mssqldb` URL format |

Each engine is defined declaratively (scheme, default port, fields, suggested params, URI rules) so adding an engine requires only a new definition.

---

## User Stories

### P1: Build a URI from a form ⭐ MVP

**User Story**: As a developer, I want to fill host, port, user, password and database in a form so that I get a ready-to-use connection URI.

**Why P1**: Core tool.

**Acceptance Criteria**:

1. WHEN the user selects an engine THEN the system SHALL show the relevant fields and apply defaults (see Supported Engines table):
   - PostgreSQL: `postgresql://user:pass@host:5432/db`
   - MySQL: `mysql://user:pass@host:3306/db`
   - MongoDB: `mongodb://` with port, or `mongodb+srv://` (no port field) via "SRV" toggle
   - Redis: `redis://`, `rediss://` via "TLS" toggle; database is a numeric index (default range 0–15)
   - Oracle: `tcp://host:1521/service_name` (`tcps://` and port 2484 via "TLS" toggle); "Database" field is labeled "Service name"
   - ClickHouse: `clickhouse://user:pass@host:9000/db`; "Secure" toggle switches default port to 9440 and adds `secure=true`
   - SQL Server: `sqlserver://user:pass@host:1433?database=db` (database goes in the query string, optional named instance as `host/instance`)
2. WHEN any field changes THEN the system SHALL update the URI preview in real time.
3. WHEN username is empty THEN the URI SHALL omit the userinfo section; WHEN only password is empty THEN it SHALL omit `:password`.
4. WHEN MongoDB is selected THEN the system SHALL allow multiple hosts (`host1:port1,host2:port2`) except in SRV mode.
5. WHEN required fields are missing (host) THEN the system SHALL show inline field errors linked via `aria-describedby` and no URI copy action.
6. WHEN the user activates "Copy" THEN the system SHALL copy the full URI (with real password) and announce it.
7. WHEN the preview renders THEN the password SHALL be masked by default (`••••`), with an accessible "Show password" toggle.
8. WHEN Oracle is selected THEN the system SHALL hide username/password fields and show a notice that Easy Connect Plus does not carry credentials (drivers receive them separately).
9. WHEN SQL Server is selected and an instance name is given THEN the URI SHALL use `host/instance` and omit the port unless explicitly set.

**Independent Test**: Select PostgreSQL, fill fields, verify `postgresql://user:pass@host:5432/db`.

---

### P1: Suggested common parameters ⭐ MVP

**User Story**: As a developer, I want the most used query params suggested per engine so that I don't have to remember names and allowed values.

**Why P1**: Explicitly requested (e.g. `sslmode`).

**Acceptance Criteria**:

1. WHEN an engine is selected THEN the system SHALL list suggested params with description and allowed values (select when enumerable):
   - PostgreSQL: `sslmode` (disable, allow, prefer, require, verify-ca, verify-full), `connect_timeout`, `application_name`, `search_path`/`options`, `target_session_attrs`
   - MySQL: `ssl-mode` (DISABLED, PREFERRED, REQUIRED, VERIFY_CA, VERIFY_IDENTITY), `charset`, `connectTimeout`, `timezone`
   - MongoDB: `authSource`, `replicaSet`, `retryWrites`, `w`, `tls`, `readPreference`, `appName`
   - Redis: `timeout`, `client_name` (document library-dependent params as such)
   - Oracle: `transport_connect_timeout`, `connect_timeout`, `retry_count`, `ssl_server_dn_match`, `wallet_location`
   - ClickHouse: `secure`, `compress`, `dial_timeout`, `read_timeout`, `skip_verify`
   - SQL Server: `encrypt` (true, false, strict, disable), `TrustServerCertificate`, `connection timeout`, `app name`, `ApplicationIntent` (ReadWrite, ReadOnly)
2. WHEN the user adds a suggested param THEN the system SHALL append it to the query string and remove it from suggestions.
3. WHEN the user adds a custom key/value param THEN the system SHALL include it in the query string.
4. WHEN the user removes a param THEN the system SHALL remove it from the URI.
5. WHEN a param key is duplicated THEN the system SHALL show a warning.
6. WHEN a suggested param is driver-specific (not part of the engine's core spec) THEN its description SHALL say so.

**Independent Test**: Add `sslmode=require` on PostgreSQL and verify `?sslmode=require` in the URI.

---

### P1: Automatic percent-encoding with warning ⭐ MVP

**User Story**: As a developer, I want special characters in credentials and params to be encoded automatically and be told when it happens so that the URI is valid and I understand why it differs from what I typed.

**Why P1**: Explicitly requested; most common source of broken URIs.

**Acceptance Criteria**:

1. WHEN username, password, database or param values contain reserved characters (`@ : / ? # [ ] % & = +` space, non-ASCII) THEN the system SHALL percent-encode them (RFC 3986) in the URI.
2. WHEN encoding happens THEN the system SHALL show a visible warning (`role="status"`) listing affected fields and the characters encoded (e.g. "Password: `@` → `%40`, `#` → `%23`").
3. WHEN no encoding is needed THEN the warning SHALL NOT render.
4. WHEN the user types an already-encoded sequence (e.g. `%40`) THEN the system SHALL encode `%` as `%25` and warn that input is treated as raw text.

**Independent Test**: Password `p@ss#1` → URI contains `p%40ss%231` and the warning lists `@` and `#`.

---

### P2: Security notice

**User Story**: As a developer, I want reassurance that credentials stay local so that I feel safe using real passwords.

**Acceptance Criteria**:

1. WHEN the page renders THEN the system SHALL show a short notice: credentials are processed only in the browser, not stored or sent.

**Independent Test**: Notice visible; Network tab shows no requests on input.

---

## Edge Cases

- WHEN host is an IPv6 address THEN the URI SHALL wrap it in brackets (`[::1]`).
- WHEN port is outside 1–65535 or non-numeric THEN the system SHALL show a field error.
- WHEN Oracle has multiple hosts (RAC/failover) THEN the URI SHALL list them comma-separated, as allowed by Easy Connect Plus.
- WHEN the engine is switched THEN the system SHALL keep host/user/password/database, reset port to the new default if the old one was the previous default, and drop params not supported by the new engine (with a notice).
- WHEN the page is reloaded THEN all fields SHALL be empty (no persistence).

---

## Requirement Traceability

| Requirement ID | Story                              | Task | Status |
| -------------- | ---------------------------------- | ------ | ------- |
| CONN-01        | P1: Engine selection & defaults    | T13, T14 | Verified |
| CONN-02        | P1: Real-time URI preview          | T13, T14 | Verified |
| CONN-03        | P1: Field validation               | T13, T14 | Verified |
| CONN-04        | P1: Copy + password masking        | T13, T14 | Verified |
| CONN-05        | P1: MongoDB multi-host / SRV       | T13, T14 | Verified |
| CONN-06        | P1: Suggested params per engine    | T13, T14 | Verified |
| CONN-07        | P1: Custom params                  | T13, T14 | Verified |
| CONN-08        | P1: Percent-encoding               | T13, T14 | Verified |
| CONN-09        | P1: Encoding warning               | T13, T14 | Verified |
| CONN-10        | P2: Security notice                | T13, T14 | Verified |
| CONN-11        | P1: Oracle Easy Connect Plus rules | T13, T14 | Verified |
| CONN-12        | P1: ClickHouse secure toggle       | T13, T14 | Verified |
| CONN-13        | P1: SQL Server database/instance   | T13, T14 | Verified |

**Coverage:** 13 total, 13 mapped to tasks, 0 unmapped ✅

---

## Success Criteria

- [x] All engine fixtures produce URIs accepted by the official drivers' parsers (verified in unit tests with known-good strings).
- [x] Zero network requests triggered by form input.
