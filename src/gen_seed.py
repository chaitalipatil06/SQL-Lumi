import random, json
random.seed(7)
deps=[(1,'Sales','New York'),(2,'Marketing','Austin'),(3,'Operations','Chicago'),(4,'Finance','New York'),(5,'Product','San Francisco'),(6,'HR','Remote')]
emps=[(1,'Maya Patel',None,None,'2016-03-01',185000),
(2,'Leo Garcia',1,1,'2018-06-15',140000),(3,'Aisha Khan',1,2,'2020-01-10',82000),(4,'Ben Carter',1,2,'2021-04-05',76000),(5,'Chloe Wu',1,2,'2022-09-19',71000),
(6,'Ravi Iyer',2,1,'2019-02-11',125000),(7,'Sofia Rossi',2,6,'2021-07-01',68000),(8,'Tom Becker',2,6,None,64000),
(9,'Nora Silva',3,1,'2017-11-20',130000),(10,'Omar Haddad',3,9,'2020-05-25',72000),(11,'Grace Lee',3,9,'2023-02-14',61000),
(12,'Daniel Kim',4,1,'2018-08-08',135000),(13,'Emma Novak',4,12,'2022-03-30',79000),
(14,'Priya Shah',5,1,'2019-10-01',150000),(15,'Jack Murphy',5,14,'2021-12-06',118000),(16,'Lina Costa',6,1,'2020-08-17',98000)]
# fix dept for Maya: Product? keep NULL dept as CEO? set dept 6? leave NULL to teach NULLs
regions=['East','West','North','South']
custs=[]
names=['Acme Corp','Blue Harbor','Cedar Labs','Delta Foods','Evergreen Inc','Fable Studio','Granite Bank','Helio Energy','Iris Health','Juniper Retail','Kite Logistics','Lotus Travel','Maple Schools','Nimbus Cloud']
for i,n in enumerate(names,1):
    custs.append((i,n,regions[i%4] if i!=13 else None,f'2025-{(i%12)+1:02d}-{(i*3)%27+1:02d}'))
prods=[(1,'Starter Plan','Software',49),(2,'Pro Plan','Software',199),(3,'Enterprise Plan','Software',999),(4,'Onboarding Workshop','Services',1500),(5,'Data Audit','Services',3200),(6,'Support Add-on','Software',99)]
orders=[]
oid=1
reps=[3,4,5,2]
for m in range(1,13):
    yr=2025 if m<=12 else 2026
for k in range(60):
    c=random.randint(1,12)  # 13,14 never order
    p=random.choice([1,2,2,3,4,5,6,6])
    q=random.randint(1,5) if p in (1,2,6) else 1
    amt=prods[p-1][3]*q
    y=random.choice([2025,2025,2026])
    mo=random.randint(1,12) if y==2025 else random.randint(1,10)
    d=f'{y}-{mo:02d}-{random.randint(1,28):02d}'
    st=random.choices(['completed','cancelled','pending'],[78,12,10])[0]
    orders.append((oid,c,random.choice(reps),p,d,q,amt,st)); oid+=1
orders.sort(key=lambda o:o[4])
orders=[(i+1,)+o[1:] for i,o in enumerate(orders)]
def v(x): return 'NULL' if x is None else (str(x) if isinstance(x,(int,float)) else "'"+x.replace("'","''")+"'")
out=["CREATE TABLE departments (dept_id INTEGER PRIMARY KEY, dept_name TEXT NOT NULL, location TEXT);",
"CREATE TABLE employees (emp_id INTEGER PRIMARY KEY, name TEXT NOT NULL, dept_id INTEGER REFERENCES departments(dept_id), manager_id INTEGER REFERENCES employees(emp_id), hire_date TEXT, salary INTEGER);",
"CREATE TABLE customers (customer_id INTEGER PRIMARY KEY, name TEXT, region TEXT, signup_date TEXT);",
"CREATE TABLE products (product_id INTEGER PRIMARY KEY, product_name TEXT, category TEXT, price INTEGER);",
"CREATE TABLE orders (order_id INTEGER PRIMARY KEY, customer_id INTEGER REFERENCES customers(customer_id), emp_id INTEGER REFERENCES employees(emp_id), product_id INTEGER REFERENCES products(product_id), order_date TEXT, quantity INTEGER, amount INTEGER, status TEXT);"]
for t,rows in [('departments',deps),('employees',emps),('customers',custs),('products',prods),('orders',orders)]:
    out.append(f"INSERT INTO {t} VALUES "+",".join("("+",".join(v(x) for x in r)+")" for r in rows)+";")

# ---- product analytics tables (separate RNG so earlier tables stay identical) ----
import datetime as _dt
R2=random.Random(2025)
channels=['Organic','Paid Search','Referral','Social']; countries=['US','US','US','UK','India','Canada']
users=[]; events=[]; eid=1
for u in range(1,61):
    sd=_dt.date(2025,1,1)+_dt.timedelta(days=R2.randint(0,180))
    ch=R2.choice(channels); users.append((u,sd.isoformat(),ch,R2.choice(countries)))
    plat=R2.choice(['web','web','ios','android'])
    events.append((eid,u,'visit',(sd-_dt.timedelta(days=R2.randint(0,3))).isoformat(),plat)); eid+=1
    p_sign={'Organic':.8,'Paid Search':.6,'Referral':.9,'Social':.55}[ch]
    if R2.random()<p_sign:
        events.append((eid,u,'signup',sd.isoformat(),plat)); eid+=1
        if R2.random()<.6:
            events.append((eid,u,'trial_start',(sd+_dt.timedelta(days=R2.randint(0,5))).isoformat(),plat)); eid+=1
            if R2.random()<.5:
                events.append((eid,u,'purchase',(sd+_dt.timedelta(days=R2.randint(6,20))).isoformat(),plat)); eid+=1
        # monthly logins with decay
        stay=.85
        for m in range(1,7):
            if R2.random()<stay:
                d=sd+_dt.timedelta(days=30*m+R2.randint(-5,5))
                if d<=_dt.date(2025,12,31): events.append((eid,u,'login',d.isoformat(),plat)); eid+=1
                stay*=.88
            else: break
        # a few consecutive-day streaks for gaps-and-islands practice
        if u%7==0:
            base=sd+_dt.timedelta(days=10)
            for k in [0,1,2,3,6,7,9]:
                events.append((eid,u,'login',(base+_dt.timedelta(days=k)).isoformat(),plat)); eid+=1
events.sort(key=lambda e:(e[3],e[1])); events=[(i+1,)+e[1:] for i,e in enumerate(events)]
out.append("CREATE TABLE users (user_id INTEGER PRIMARY KEY, signup_date TEXT, channel TEXT, country TEXT);")
out.append("CREATE TABLE events (event_id INTEGER PRIMARY KEY, user_id INTEGER REFERENCES users(user_id), event_name TEXT, event_date TEXT, platform TEXT);")
for t,rows in [('users',users),('events',events)]:
    out.append(f"INSERT INTO {t} VALUES "+",".join("("+",".join(v(x) for x in r)+")" for r in rows)+";")
print('events',len(events))

open('seed.sql','w').write("\n".join(out))
print(len(orders))
