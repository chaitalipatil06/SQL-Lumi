// ===== SQL Quest: advanced chapters 11-16 (business analytics level) =====
CHAPTERS.push(
// ---------------------------------------------------------------- 11
{
  id: 11, title: "Changing Data", sub: "INSERT, UPDATE, DELETE, UPSERT and transactions", art: "switch", color: "#ffd6e0",
  lumi: "So far we've only read data. Now we change it! Always preview with SELECT first. Lumi's golden safety rule.",
  roleTip: "Analysts fix bad records, load lookup tables and maintain mapping tables. Interviewers ask: \"What's the difference between DELETE and TRUNCATE?\" and \"How do you undo a mistake?\"",
  sections: [
    { h: "INSERT: add rows", html: `
      <pre class="sql">INSERT INTO products (product_id, product_name, category, price)
VALUES (7, 'Analytics Add-on', 'Software', 299);

SELECT * FROM products;</pre>
      <p>List the columns, then the values in the same order. Add several rows at once by separating them with commas: <code>VALUES (...), (...)</code>.</p>
      <div class="callout tip">The playground keeps your changes. Click <b>↺ Reset data</b> at any time to restore the original tables.</div>` },
    { h: "UPDATE: change rows", html: `
      <p><b>Step 1: preview</b> which rows will change:</p>
      <pre class="sql">SELECT product_name, price FROM products WHERE category = 'Software';</pre>
      <p><b>Step 2: update</b> using the exact same WHERE:</p>
      <pre class="sql">UPDATE products
SET price = price * 1.10
WHERE category = 'Software';

SELECT product_name, price FROM products;</pre>
      <div class="callout warn">An UPDATE without WHERE changes <b>every row</b> in the table. Always preview first.</div>` },
    { h: "DELETE vs TRUNCATE vs DROP", html: `
      <pre class="sql">DELETE FROM orders WHERE status = 'cancelled';
SELECT status, COUNT(*) FROM orders GROUP BY status;</pre>
      <table class="mini"><tr><th>Command</th><th>Removes</th><th>Can filter?</th></tr>
      <tr><td><code>DELETE FROM t WHERE …</code></td><td>chosen rows</td><td>yes</td></tr>
      <tr><td><code>TRUNCATE TABLE t</code></td><td>all rows, fast (not in SQLite)</td><td>no</td></tr>
      <tr><td><code>DROP TABLE t</code></td><td>the whole table and its structure</td><td>no</td></tr></table>` },
    { h: "Transactions: your undo button", html: `
      <p>Wrap risky changes in a <b>transaction</b>. <code>COMMIT</code> keeps them and <code>ROLLBACK</code> cancels them all:</p>
      <pre class="sql">BEGIN;
DELETE FROM orders;            -- oops, deleted everything!
ROLLBACK;                      -- phew, undone
SELECT COUNT(*) AS orders_still_here FROM orders;</pre>
      <p>Transactions are <b>ACID</b>: <b>A</b>tomic (all or nothing), <b>C</b>onsistent (rules still hold), <b>I</b>solated (others don't see half-done work), and <b>D</b>urable (saved changes survive a crash).</p>` },
    { h: "UPSERT: insert or update", html: `
      <p>"Add this product, or update its price if it already exists":</p>
      <pre class="sql">INSERT INTO products (product_id, product_name, category, price)
VALUES (2, 'Pro Plan', 'Software', 229)
ON CONFLICT(product_id) DO UPDATE SET price = excluded.price;

SELECT * FROM products WHERE product_id = 2;</pre>
      <div class="callout">The same idea in other databases: PostgreSQL uses this exact syntax. MySQL uses <code>ON DUPLICATE KEY UPDATE</code>, and SQL Server and Snowflake use <code>MERGE</code>.</div>` }
  ],
  quiz: [
    { q: "What happens with UPDATE employees SET salary = 0; (no WHERE)?", opts: ["Nothing","Every employee's salary becomes 0","Only the first row changes","It errors"], a: 1, why: "No WHERE means every row. Preview with SELECT and use transactions!" },
    { q: "You ran a DELETE inside BEGIN and realise it was wrong. What do you run?", opts: ["COMMIT","ROLLBACK","DROP","UNDO"], a: 1, why: "ROLLBACK cancels everything since BEGIN." },
    { q: "Which removes the table itself, including its structure?", opts: ["DELETE","TRUNCATE","DROP","UPDATE"], a: 2, why: "DROP removes the table definition. DELETE and TRUNCATE only remove rows." }
  ],
  challenge: { prompt: "Give every employee in the <b>Sales</b> department (<code>dept_id = 1</code>) a <b>5% raise</b>. We'll check the employees table afterwards.", starter: "UPDATE employees\nSET \nWHERE ", solution: "UPDATE employees SET salary = salary * 1.05 WHERE dept_id = 1;", verify: "SELECT emp_id, salary FROM employees ORDER BY emp_id;", ordered: true, hint: "SET salary = salary * 1.05 WHERE dept_id = 1" }
},
// ---------------------------------------------------------------- 12
{
  id: 12, title: "Building Tables & Views", sub: "CREATE TABLE, constraints, ALTER, views, normalization", art: "table", color: "#d6ecff",
  lumi: "Time to be the architect! Good tables have the right types and rules, so bad data can't sneak in.",
  roleTip: "Analysts build staging tables and saved views that dashboards read from. Normalization (1NF to 3NF) is a classic business analytics interview question.",
  sections: [
    { h: "CREATE TABLE with rules (constraints)", html: `
      <pre class="sql">CREATE TABLE IF NOT EXISTS suppliers (
  supplier_id INTEGER PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  country     TEXT DEFAULT 'US',
  rating      INTEGER CHECK (rating BETWEEN 1 AND 5)
);
INSERT INTO suppliers (name, rating) VALUES ('Northwind', 4);
SELECT * FROM suppliers;</pre>
      <p>Now try breaking a rule. The database refuses:</p>
      <pre class="sql">INSERT INTO suppliers (name, rating) VALUES ('Acme', 9);</pre>
      <table class="mini"><tr><th>Constraint</th><th>Guarantees</th></tr><tr><td>PRIMARY KEY</td><td>unique row id</td></tr><tr><td>NOT NULL</td><td>value required</td></tr><tr><td>UNIQUE</td><td>no duplicates</td></tr><tr><td>CHECK</td><td>custom rule</td></tr><tr><td>DEFAULT</td><td>value if none given</td></tr><tr><td>FOREIGN KEY / REFERENCES</td><td>value exists in the parent table</td></tr></table>` },
    { h: "Change a table: ALTER & DROP", html: `
      <pre class="sql">ALTER TABLE customers ADD COLUMN tier TEXT DEFAULT 'Standard';
SELECT name, tier FROM customers LIMIT 5;</pre>
      <p>Remove a table safely with <code>DROP TABLE IF EXISTS suppliers;</code></p>` },
    { h: "Copy query results into a table", html: `
      <pre class="sql">CREATE TABLE IF NOT EXISTS orders_2025 AS
SELECT * FROM orders WHERE order_date LIKE '2025%';
SELECT COUNT(*) FROM orders_2025;</pre>
      <p><code>INSERT INTO target SELECT …</code> appends query results to a table that already exists. It's the backbone of many data pipelines.</p>` },
    { h: "Views: saved queries", html: `
      <p>A <b>view</b> is a saved SELECT that you query like a table. Teams use views so everyone shares one agreed definition of "revenue".</p>
      <pre class="sql">CREATE VIEW IF NOT EXISTS v_completed AS
SELECT order_id, customer_id, order_date, amount
FROM orders
WHERE status = 'completed';

SELECT COUNT(*) AS orders, SUM(amount) AS revenue FROM v_completed;</pre>
      <p>A view stores <i>no data</i>: it re-runs every time. A <b>materialized view</b>, available in PostgreSQL and Snowflake, stores the result for speed.</p>` },
    { h: "Normalization in plain English", html: `
      <ul>
        <li><b>1NF</b>: one value per cell (no "red, blue" in one cell) and no repeating columns (color1, color2…).</li>
        <li><b>2NF</b>: every column depends on the <i>whole</i> key, not part of it.</li>
        <li><b>3NF</b>: no column depends on another non-key column. A customer's region lives in <code>customers</code>, not copied onto every order.</li>
      </ul>
      <p>Normalized = less duplication and fewer update errors. <b>Data warehouses</b> often <i>denormalize</i> on purpose (star schemas) to make reporting fast.</p>` }
  ],
  quiz: [
    { q: "Which constraint stops a rating of 9 when ratings must be 1–5?", opts: ["UNIQUE","CHECK","DEFAULT","PRIMARY KEY"], a: 1, why: "CHECK enforces a custom rule on values." },
    { q: "A view…", opts: ["Stores a copy of the data","Is a saved query that runs when you select from it","Speeds up every query automatically","Can't be joined"], a: 1, why: "Plain views store no data; they're saved SELECTs." },
    { q: "Customer region is copied onto every order row. Which normal form does that break?", opts: ["1NF","3NF","None","It's required"], a: 1, why: "Region depends on the customer, not the order key: a transitive dependency, which 3NF removes." }
  ],
  challenge: { prompt: "Create a view named <code>customer_revenue</code> with two columns: <code>customer_id</code> and <code>revenue</code> (sum of <b>completed</b> order amounts). We'll query your view to check it.", starter: "CREATE VIEW customer_revenue AS\nSELECT ", solution: "CREATE VIEW customer_revenue AS SELECT customer_id, SUM(amount) AS revenue FROM orders WHERE status = 'completed' GROUP BY customer_id;", verify: "SELECT * FROM customer_revenue ORDER BY customer_id;", ordered: true, hint: "CREATE VIEW customer_revenue AS SELECT customer_id, SUM(amount) AS revenue FROM orders WHERE status = 'completed' GROUP BY customer_id;" }
},
// ---------------------------------------------------------------- 13
{
  id: 13, title: "Combine & Clean", sub: "UNION, INTERSECT, EXCEPT, NULL traps, duplicates, CAST", art: "venn", color: "#d9f7e6",
  lumi: "Real data is messy! Let's stack tables, compare lists, and tame those sneaky NULLs.",
  roleTip: "\"Why does my count look wrong?\" is usually NULLs or duplicates. Spotting these quickly is what makes an analyst trusted.",
  sections: [
    { h: "Stack results: UNION vs UNION ALL", html: `
      <pre class="sql">SELECT name, 'customer' AS type FROM customers
UNION ALL
SELECT name, 'employee' FROM employees;</pre>
      <p>Both queries must have the same number of columns, with compatible types. <code>UNION</code> removes duplicate rows, which is slower. <code>UNION ALL</code> keeps everything.</p>` },
    { h: "Compare lists: INTERSECT & EXCEPT", html: `
      <pre class="sql">-- Customers who bought BOTH the Pro Plan (2) and Enterprise Plan (3)
SELECT customer_id FROM orders WHERE product_id = 2
INTERSECT
SELECT customer_id FROM orders WHERE product_id = 3;</pre>
      <pre class="sql">-- Customers who ordered but never cancelled
SELECT customer_id FROM orders
EXCEPT
SELECT customer_id FROM orders WHERE status = 'cancelled';</pre>
      <p>Oracle calls EXCEPT <code>MINUS</code>. Older MySQL versions lack both, so you'd use <code>JOIN</code> or <code>NOT EXISTS</code> instead.</p>` },
    { h: "NULL traps that break reports", html: `
      <pre class="sql">SELECT COUNT(*) AS all_rows, COUNT(hire_date) AS with_date, COUNT(DISTINCT dept_id) AS depts
FROM employees;</pre>
      <p>The famous <b>NOT IN + NULL</b> trap. This returns 0, because one manager_id is NULL:</p>
      <pre class="sql">SELECT COUNT(*) FROM employees
WHERE emp_id NOT IN (SELECT manager_id FROM employees);</pre>
      <p>Fix it by filtering out the NULLs (or use NOT EXISTS):</p>
      <pre class="sql">SELECT name FROM employees
WHERE emp_id NOT IN (SELECT manager_id FROM employees WHERE manager_id IS NOT NULL);</pre>
      <div class="callout tip"><code>AVG</code> ignores NULLs. To count missing values as 0, write <code>AVG(COALESCE(col, 0))</code>. Decide on purpose!</div>` },
    { h: "Find and remove duplicates", html: `
      <pre class="sql">-- Find duplicates
SELECT customer_id, product_id, COUNT(*) AS n
FROM orders GROUP BY customer_id, product_id HAVING COUNT(*) > 1;</pre>
      <pre class="sql">-- Keep only the latest order per customer + product
WITH r AS (
  SELECT *, ROW_NUMBER() OVER (PARTITION BY customer_id, product_id ORDER BY order_date DESC) AS rn
  FROM orders)
SELECT order_id, customer_id, product_id, order_date FROM r WHERE rn = 1;</pre>` },
    { h: "Types and CAST", html: `
      <pre class="sql">SELECT CAST('42' AS INTEGER) + 1 AS n,
       CAST(amount AS REAL) / 3 AS third,
       typeof(order_date) AS stored_as
FROM orders LIMIT 3;</pre>
      <p>Dates stored as text sort correctly <b>only</b> in the format <code>YYYY-MM-DD</code>. In interviews, mention checking data types early.</p>` }
  ],
  quiz: [
    { q: "UNION vs UNION ALL: which keeps duplicates?", opts: ["UNION","UNION ALL","Both","Neither"], a: 1, why: "UNION ALL keeps every row. UNION de-duplicates." },
    { q: "WHERE id NOT IN (subquery) returns no rows at all. The likely cause?", opts: ["The subquery returns a NULL","A missing index","A typo in SELECT","Too many rows"], a: 0, why: "x NOT IN (…, NULL) is never true. Filter out NULLs or use NOT EXISTS." },
    { q: "Rows in A that are not in B:", opts: ["INTERSECT","UNION","EXCEPT","JOIN"], a: 2, why: "EXCEPT returns rows of the first query missing from the second." }
  ],
  challenge: { prompt: "List the <code>name</code> of employees who <b>don't manage anyone</b> (no employee has them as <code>manager_id</code>). Watch out for the NULL trap!", starter: "SELECT name\nFROM employees\nWHERE ", solution: "SELECT name FROM employees e WHERE NOT EXISTS (SELECT 1 FROM employees x WHERE x.manager_id = e.emp_id);", ordered: false, hint: "NOT EXISTS (SELECT 1 FROM employees x WHERE x.manager_id = e.emp_id)" }
},
// ---------------------------------------------------------------- 14
{
  id: 14, title: "Dates & Text Deep Dive", sub: "Date math, periods, weekdays, string surgery, formatting", art: "sort", color: "#fff1c9",
  lumi: "Every business question has a time window: last month, this quarter, year over year. Let's master dates!",
  roleTip: "Date bucketing and date differences show up in almost every analyst task and take-home assignment.",
  sections: [
    { h: "Pull pieces out of a date", html: `
      <pre class="sql">SELECT order_date,
       strftime('%Y', order_date) AS year,
       strftime('%m', order_date) AS month,
       strftime('%Y-%m', order_date) AS year_month,
       strftime('%w', order_date) AS weekday_0_sun
FROM orders LIMIT 5;</pre>
      <p>Quarter: <code>(CAST(strftime('%m', d) AS INTEGER) + 2) / 3</code>. In PostgreSQL it's simply <code>EXTRACT(QUARTER FROM d)</code>.</p>` },
    { h: "Date math", html: `
      <pre class="sql">SELECT order_date,
       date(order_date, '+30 days')          AS due_date,
       date(order_date, 'start of month')    AS month_start,
       date(order_date, 'start of month', '+1 month', '-1 day') AS month_end,
       CAST(julianday('2026-11-01') - julianday(order_date) AS INTEGER) AS days_ago
FROM orders LIMIT 5;</pre>
      <table class="mini"><tr><th>Task</th><th>SQLite</th><th>PostgreSQL</th><th>SQL Server</th></tr>
      <tr><td>Add days</td><td><code>date(d,'+7 days')</code></td><td><code>d + INTERVAL '7 day'</code></td><td><code>DATEADD(day,7,d)</code></td></tr>
      <tr><td>Days between</td><td><code>julianday(b)-julianday(a)</code></td><td><code>b - a</code></td><td><code>DATEDIFF(day,a,b)</code></td></tr>
      <tr><td>Month start</td><td><code>date(d,'start of month')</code></td><td><code>DATE_TRUNC('month',d)</code></td><td><code>DATETRUNC(month,d)</code></td></tr></table>` },
    { h: "Name the weekday", html: `
      <pre class="sql">SELECT CASE strftime('%w', order_date)
         WHEN '0' THEN 'Sun' WHEN '1' THEN 'Mon' WHEN '2' THEN 'Tue' WHEN '3' THEN 'Wed'
         WHEN '4' THEN 'Thu' WHEN '5' THEN 'Fri' ELSE 'Sat' END AS weekday,
       COUNT(*) AS orders
FROM orders GROUP BY weekday ORDER BY orders DESC;</pre>` },
    { h: "Text surgery", html: `
      <pre class="sql">SELECT name,
       LOWER(REPLACE(name, ' ', '.')) || '@lumilabs.com' AS email,
       SUBSTR(name, 1, INSTR(name, ' ') - 1)              AS first_name,
       SUBSTR(name, INSTR(name, ' ') + 1)                 AS last_name,
       LENGTH(name)                                        AS chars
FROM employees LIMIT 6;</pre>
      <p>Other useful functions: <code>TRIM</code>, <code>UPPER</code>, <code>REPLACE</code>, and <code>printf('%.2f', x)</code> for number formatting. In PostgreSQL use <code>SPLIT_PART</code> and <code>TO_CHAR</code>; in SQL Server use <code>CHARINDEX</code> and <code>FORMAT</code>.</p>` }
  ],
  quiz: [
    { q: "strftime('%Y-%m', '2025-07-19') returns…", opts: ["2025-07-19","2025-07","07-2025","July 2025"], a: 1, why: "%Y = year, %m = two-digit month." },
    { q: "Days between two dates in SQLite?", opts: ["b - a on text","julianday(b) - julianday(a)","DATEDIFF(b,a)","DAYS(a,b)"], a: 1, why: "julianday turns dates into numbers you can subtract." },
    { q: "Why store dates as 'YYYY-MM-DD'?", opts: ["It's shorter","It sorts and compares correctly as text","Excel needs it","No reason"], a: 1, why: "Year-first text sorts chronologically. '03/01/2025' does not." }
  ],
  challenge: { prompt: "For each month of <b>2025</b>, count <b>completed</b> orders. Columns: <code>month</code> (format <code>YYYY-MM</code>) and <code>orders</code>, sorted by month.", starter: "SELECT strftime('%Y-%m', order_date) AS month,\n", solution: "SELECT strftime('%Y-%m', order_date) AS month, COUNT(*) AS orders FROM orders WHERE status = 'completed' AND order_date LIKE '2025%' GROUP BY month ORDER BY month;", ordered: true, hint: "WHERE status = 'completed' AND order_date LIKE '2025%' GROUP BY month ORDER BY month" }
},
// ---------------------------------------------------------------- 15
{
  id: 15, title: "Analytics Patterns", sub: "Funnels, conversion, cohorts & retention, streaks, medians", art: "groups", color: "#efe1ff",
  lumi: "This is the stuff product and business analysts do every week. Meet the new users and events tables!",
  roleTip: "Funnel, retention and cohort questions are the core of product analyst and growth interviews. These patterns are reusable templates.",
  sections: [
    { h: "Meet users & events", html: `
      <p><code>users</code>: one row per user (signup_date, channel, country). <code>events</code>: one row per action (visit, signup, trial_start, purchase, login), with a date and a platform.</p>
      <pre class="sql">SELECT event_name, COUNT(*) AS events, COUNT(DISTINCT user_id) AS users
FROM events GROUP BY event_name ORDER BY users DESC;</pre>` },
    { h: "The conversion funnel", html: `
      <pre class="sql">WITH f AS (
  SELECT event_name AS step, COUNT(DISTINCT user_id) AS users
  FROM events
  WHERE event_name IN ('visit','signup','trial_start','purchase')
  GROUP BY event_name)
SELECT step, users,
       ROUND(100.0 * users / (SELECT users FROM f WHERE step = 'visit'), 1) AS pct_of_visitors
FROM f ORDER BY users DESC;</pre>
      <p>Break it down by acquisition channel with conditional counting:</p>
      <pre class="sql">SELECT u.channel,
       COUNT(DISTINCT CASE WHEN e.event_name = 'signup'   THEN e.user_id END) AS signups,
       COUNT(DISTINCT CASE WHEN e.event_name = 'purchase' THEN e.user_id END) AS buyers
FROM users u JOIN events e ON e.user_id = u.user_id
GROUP BY u.channel;</pre>` },
    { h: "Cohort retention", html: `
      <p>Group users by their <b>signup month</b> (the cohort), then ask: how many came back in month 1, month 2…?</p>
      <pre class="sql">WITH c AS (
  SELECT user_id, date(signup_date, 'start of month') AS cohort FROM users),
a AS (
  SELECT DISTINCT e.user_id, c.cohort,
         (CAST(strftime('%Y', e.event_date) AS INTEGER) - CAST(strftime('%Y', c.cohort) AS INTEGER)) * 12
       + CAST(strftime('%m', e.event_date) AS INTEGER) - CAST(strftime('%m', c.cohort) AS INTEGER) AS month_n
  FROM events e JOIN c ON c.user_id = e.user_id
  WHERE e.event_name = 'login')
SELECT cohort, month_n, COUNT(*) AS active_users
FROM a GROUP BY cohort, month_n ORDER BY cohort, month_n;</pre>
      <p>Pivot this result in Excel or Power BI and you've got the classic retention triangle.</p>` },
    { h: "Streaks: gaps & islands", html: `
      <p>Consecutive days share the same <code>date − row_number</code>. That neat trick groups each streak together:</p>
      <pre class="sql">WITH d AS (SELECT DISTINCT user_id, event_date FROM events WHERE event_name = 'login'),
g AS (SELECT user_id, event_date,
             julianday(event_date) - ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY event_date) AS grp
      FROM d)
SELECT user_id, MIN(event_date) AS streak_start, COUNT(*) AS days
FROM g GROUP BY user_id, grp
HAVING COUNT(*) >= 3 ORDER BY days DESC;</pre>` },
    { h: "Median without a MEDIAN function", html: `
      <pre class="sql">WITH r AS (
  SELECT amount, ROW_NUMBER() OVER (ORDER BY amount) AS rn, COUNT(*) OVER () AS n
  FROM orders WHERE status = 'completed')
SELECT AVG(amount) AS median_amount
FROM r WHERE rn IN ((n + 1) / 2, (n + 2) / 2);</pre>
      <p>PostgreSQL and Snowflake have <code>PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY amount)</code>. Medians resist outliers, so report them alongside averages.</p>` }
  ],
  quiz: [
    { q: "Why COUNT(DISTINCT user_id) in a funnel, not COUNT(*)?", opts: ["It's faster","Users can fire the same event many times","COUNT(*) skips NULLs","No reason"], a: 1, why: "Funnels count people, not clicks." },
    { q: "A 'cohort' is usually…", opts: ["A product category","Users grouped by when they started","A sales region","A database index"], a: 1, why: "Cohorts group users by a shared start, typically signup month." },
    { q: "In gaps-and-islands, consecutive dates share the same…", opts: ["date + 1","date − ROW_NUMBER()","COUNT(*)","user_id only"], a: 1, why: "Both increase by 1 together, so their difference stays constant within a streak." }
  ],
  challenge: { prompt: "Signup-to-purchase conversion by <code>channel</code>. Columns: <code>channel</code>, <code>signups</code>, <code>purchasers</code>, <code>conversion_pct</code> (purchasers ÷ signups × 100, rounded to 1 decimal).", starter: "SELECT u.channel,\n", solution: "SELECT u.channel, COUNT(DISTINCT CASE WHEN e.event_name = 'signup' THEN e.user_id END) AS signups, COUNT(DISTINCT CASE WHEN e.event_name = 'purchase' THEN e.user_id END) AS purchasers, ROUND(100.0 * COUNT(DISTINCT CASE WHEN e.event_name = 'purchase' THEN e.user_id END) / COUNT(DISTINCT CASE WHEN e.event_name = 'signup' THEN e.user_id END), 1) AS conversion_pct FROM users u JOIN events e ON e.user_id = u.user_id GROUP BY u.channel;", ordered: false, hint: "COUNT(DISTINCT CASE WHEN e.event_name = 'signup' THEN e.user_id END), and the same for purchase, then ROUND(100.0 * purchasers / signups, 1)" }
},
// ---------------------------------------------------------------- 16
{
  id: 16, title: "Performance & the SQL Interview", sub: "Indexes, query plans, warehouses, and a winning interview method", art: "trophy", color: "#fff0d6",
  lumi: "The final chapter! Let's make queries fast and walk into your interview with a plan. You've totally got this.",
  roleTip: "Interviewers grade how you think, not only the final query. The 5-step method below is what strong candidates do out loud.",
  sections: [
    { h: "Indexes: the book's index for your table", html: `
      <p>Without an index, the database reads every row (a <b>full scan</b>). An index lets it jump straight to the matching rows.</p>
      <pre class="sql">EXPLAIN QUERY PLAN SELECT * FROM orders WHERE customer_id = 3;</pre>
      <pre class="sql">CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
EXPLAIN QUERY PLAN SELECT * FROM orders WHERE customer_id = 3;</pre>
      <p>The plan changes from <code>SCAN orders</code> to <code>SEARCH orders USING INDEX</code>. Indexes speed up reads but slow down writes, so index columns you <b>filter and join</b> on.</p>` },
    { h: "Write index-friendly (sargable) filters", html: `
      <table class="mini"><tr><th>Slow (can't use index)</th><th>Fast</th></tr>
      <tr><td><code>WHERE strftime('%Y', order_date) = '2025'</code></td><td><code>WHERE order_date &gt;= '2025-01-01' AND order_date &lt; '2026-01-01'</code></td></tr>
      <tr><td><code>WHERE UPPER(name) = 'ACME'</code></td><td>store clean data, or use a case-insensitive collation</td></tr>
      <tr><td><code>WHERE name LIKE '%corp'</code></td><td><code>WHERE name LIKE 'corp%'</code></td></tr>
      <tr><td><code>SELECT *</code> on wide tables</td><td>select only the columns you need</td></tr></table>` },
    { h: "Warehouse vocabulary", html: `
      <ul>
        <li><b>OLTP vs OLAP</b>: apps write many small transactions (OLTP); analytics reads big aggregations (OLAP).</li>
        <li><b>Star schema</b>: a fact table (orders) surrounded by dimensions (customers, products, dates).</li>
        <li><b>Grain</b>: what one row represents ("one row per order line"). Always state it first!</li>
        <li><b>ETL vs ELT</b>: transform before loading, or load raw data and transform inside the warehouse (dbt, Snowflake, BigQuery).</li>
        <li><b>Slowly changing dimension (SCD Type 2)</b>: keep history by adding a new row with valid_from / valid_to dates.</li>
      </ul>` },
    { h: "The 5-step interview method", html: `
      <ol>
        <li><b>Clarify:</b> time window? ties? NULLs? "completed orders only?"</li>
        <li><b>Find the grain</b> of each table and the join keys.</li>
        <li><b>Build in CTE steps</b> and run each step.</li>
        <li><b>Check edge cases:</b> empty groups, duplicates, divide-by-zero (<code>NULLIF</code>).</li>
        <li><b>Explain</b> your result and one improvement (an index, a different metric definition).</li>
      </ol>
      <div class="callout tip">Next stop: the <a href="#gym">🏋️ Practice Gym</a> (47 problems) and the <a href="#mock">⏱️ Mock Interview</a>.</div>` }
  ],
  quiz: [
    { q: "Which filter can use an index on order_date?", opts: ["strftime('%Y', order_date) = '2025'","order_date >= '2025-01-01' AND order_date < '2026-01-01'","order_date LIKE '%2025'","CAST(order_date AS TEXT) = '2025'"], a: 1, why: "Wrapping the column in a function hides it from the index. Range filters on the raw column are sargable." },
    { q: "The 'grain' of a table means…", opts: ["Its size in MB","What one row represents","Its primary key type","How fast it is"], a: 1, why: "Grain = what one row is. Getting it wrong causes double counting." },
    { q: "Indexes make writes (INSERT/UPDATE)…", opts: ["Faster","Slower, because the index must be updated too","No different","Impossible"], a: 1, why: "Every index has to be maintained on write. That's the trade-off." }
  ],
  challenge: { prompt: "Classic interview question: find the <b>second-highest-paid</b> employee in each department. Columns: <code>dept_id</code>, <code>name</code>, <code>salary</code>. Skip employees with no department.", starter: "WITH ranked AS (\n  SELECT dept_id, name, salary,\n         \n  FROM employees\n  WHERE dept_id IS NOT NULL\n)\nSELECT ", solution: "WITH ranked AS (SELECT dept_id, name, salary, DENSE_RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS rk FROM employees WHERE dept_id IS NOT NULL) SELECT dept_id, name, salary FROM ranked WHERE rk = 2;", ordered: false, hint: "DENSE_RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC), then keep rank 2." }
}
);

// ---- rewards for the new chapters ----
GAMES.find(g => g.id === 5).desc = "60 seconds. True or false? Answer as many as you can!";
GAMES.push(
  { id: 6, after: 12, title: "Command Match", kind: "memory", desc: "Match each command to what it does. Fewest flips wins!",
    pairs: [["INSERT","add rows"],["UPDATE","change rows"],["DELETE","remove rows"],["ROLLBACK","undo transaction"],["CREATE VIEW","saved query"],["CHECK","custom rule"],["DROP","remove table"],["UPSERT","insert or update"]] },
  { id: 7, after: 14, title: "Date & Text Puzzles", kind: "teaser", desc: "What does each expression return? Type the number.",
    rounds: [
      { q: "strftime('%m', '2025-07-04') as a number = ?", a: "7", why: "%m is the month: 07, which is 7." },
      { q: "julianday('2025-03-10') - julianday('2025-03-01') = ?", a: "9", why: "From the 1st to the 10th is 9 days." },
      { q: "LENGTH('Lumi Labs') = ?", a: "9", why: "Spaces count: L-u-m-i-space-L-a-b-s." },
      { q: "INSTR('data@lumi.com', '@') = ?", a: "5", why: "'@' is the 5th character (SQL counts from 1)." },
      { q: "(CAST(strftime('%m','2025-08-15') AS INTEGER) + 2) / 3 = which quarter?", a: "3", why: "(8 + 2) / 3 = 3 in integer math, so Q3." },
      { q: "How many rows: SELECT 1 UNION SELECT 1 UNION SELECT 2 ?", a: "2", why: "UNION removes the duplicate 1." }
    ] },
  { id: 8, after: 16, title: "Final Boss Blitz", kind: "blitz", desc: "60 seconds of everything. Then claim your certificate!",
    items: [
      ["UNION ALL keeps duplicate rows.", true], ["A view stores a copy of the data.", false], ["ROLLBACK undoes changes since BEGIN.", true], ["NOT IN with a NULL in the list can return no rows.", true],
      ["Indexes make INSERTs faster.", false], ["COUNT(DISTINCT user_id) counts people, not events.", true], ["EXCEPT returns rows in both queries.", false], ["CHECK constraints enforce custom rules.", true],
      ["Wrapping a column in a function can stop index use.", true], ["A cohort groups users by when they started.", true], ["UPDATE without WHERE changes one row.", false], ["julianday() helps compute days between dates.", true],
      ["DENSE_RANK leaves gaps after ties.", false], ["3NF removes columns that depend on other non-key columns.", true], ["HAVING filters rows before grouping.", false], ["ETL means Extract, Transform, Load.", true],
      ["A star schema has a fact table at the center.", true], ["DROP TABLE removes only the rows.", false], ["ON CONFLICT DO UPDATE is an upsert.", true], ["Medians are less sensitive to outliers than averages.", true]
    ] }
);
// ---- roles: map new chapters ----
ROLES[0].chapters = [1,2,3,4,5,6,7,10,13,14,16]; ROLES[1].chapters = [1,2,3,5,6,8,9,10,15,16];
ROLES[2].chapters = [1,2,3,4,5,6,7,10,11,14]; ROLES[3].chapters = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16];
ROLES[1].why = "Funnels, retention cohorts and A/B readouts, without waiting on a data team.";
