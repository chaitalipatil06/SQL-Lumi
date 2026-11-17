from playwright.sync_api import sync_playwright
import os
R=__import__('os').path.abspath(__import__('os').path.join(__import__('os').path.dirname(__file__),'..')); os.makedirs(R+'/tests/shots',exist_ok=True)
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1280,'height':900})
    errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.route('**/sql-asm.js', lambda r: r.fulfill(path=R+'/node_modules/sql.js/dist/sql-asm.js', content_type='application/javascript'))
    pg.goto('file://'+R+'/index.html'); pg.wait_for_timeout(1500)
    pg.fill('#nm','Arjun'); pg.click('#go'); pg.wait_for_timeout(500)
    bad=[]
    n=pg.evaluate("CHAPTERS.length")
    for c in range(1,n+1):
        pg.evaluate(f"location.hash='#ch-{c}'"); pg.wait_for_timeout(350)
        pg.eval_on_selector_all('.trybtn','els=>els.forEach(e=>e.click())'); pg.wait_for_timeout(250)
        # reset db so DML try-its don't affect later chapters
        errsTry=pg.eval_on_selector_all('.codebox .err','els=>els.map(e=>e.closest(".codebox").querySelector("pre").innerText.slice(0,50)+" :: "+e.innerText.slice(0,90))')
        if errsTry: bad.append((c,'tryit',errsTry))
        pg.click('#pgReset')
        sol=pg.evaluate(f"CHAPTERS[{c-1}].challenge.solution"); pg.fill('#chEditor',sol); pg.click('#chCheck'); pg.wait_for_timeout(250)
        msg=pg.inner_text('#chMsg')
        if 'Correct' not in msg: bad.append((c,'challenge',msg))
        for i,a in enumerate(pg.evaluate(f"CHAPTERS[{c-1}].quiz.map(q=>q.a)")): pg.click(f'#quiz .q[data-i="{i}"] .opt[data-j="{a}"]')
        pg.click('#claim'); pg.wait_for_timeout(300); pg.evaluate("document.querySelectorAll('.modal-bg').forEach(m=>m.remove())")
        if c in (12,15): pg.screenshot(path=f'{R}/shots/ch{c}.png',full_page=True)
    print('chapters done; issues:',bad)
    pg.evaluate("location.hash='#home'"); pg.wait_for_timeout(600); pg.screenshot(path=R+'/tests/shots/home_full.png',full_page=True)
    pg.evaluate("location.hash='#gym'"); pg.wait_for_timeout(400); pg.screenshot(path=R+'/tests/shots/gym.png',full_page=True)
    gbad=[]
    for pid in pg.evaluate("PROBLEMS.map(p=>p.id)"):
        pg.evaluate(f"location.hash='#p-{pid}'"); pg.wait_for_timeout(150)
        pg.click('#pCheck'); pg.wait_for_timeout(120)   # empty attempt must fail
        if 'Correct' in pg.inner_text('#pMsg'): gbad.append((pid,'empty passed'))
        sol=pg.evaluate(f"PROBLEMS.find(p=>p.id==='{pid}').solution"); pg.fill('#pEditor',sol); pg.click('#pCheck'); pg.wait_for_timeout(200)
        m=pg.inner_text('#pMsg')
        if 'Correct' not in m: gbad.append((pid,m[:100]))
        if pid=='H4': pg.screenshot(path=R+'/tests/shots/problem.png',full_page=True)
    print('gym issues:',gbad, 'solved', pg.evaluate("Object.keys(JSON.parse(localStorage.getItem('sqlquest-v1')).gym).length"))
    # mock interview
    pg.evaluate("location.hash='#mock'"); pg.wait_for_timeout(300); pg.click('#mStart'); pg.wait_for_timeout(300)
    for i in range(4):
        pg.click(f'[data-q="{i}"]'); pg.wait_for_timeout(150)
        qid=pg.evaluate("MOCK_ID=document.querySelector('h2').innerText"); 
        sol=pg.evaluate("(()=>{const t=document.querySelector('.challenge h2').innerText.replace(/^Q\\d\\. /,'');return PROBLEMS.find(p=>p.title===t).solution})()")
        pg.fill('#mEd',sol); pg.click('#mCheck'); pg.wait_for_timeout(250)
    pg.wait_for_timeout(1200); pg.screenshot(path=R+'/tests/shots/mock_done.png')
    print('mock result:', pg.inner_text('.card h2')[:60] if pg.query_selector('.card h2') else '?')
    for gid in (6,7,8):
        pg.evaluate(f"location.hash='#game-{gid}'"); pg.wait_for_timeout(300)
        locked=pg.query_selector('.lockmsg'); print('game',gid,'locked' if locked else 'open')
    print('ERRS',errs[:5]); b.close()
