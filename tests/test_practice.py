from playwright.sync_api import sync_playwright
import os, json
R=os.path.dirname(os.path.abspath(__file__)); os.makedirs(R+'/shots',exist_ok=True)
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1280,'height':900})
    errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.route('**/sql-asm.js', lambda r: r.fulfill(path=R+'/vendor/package/dist/sql-asm.js', content_type='application/javascript'))
    pg.goto('file://'+R+'/index.html'); pg.wait_for_timeout(1200)
    pg.evaluate("localStorage.setItem('sqlquest-v1', JSON.stringify({name:'Arjun',gems:0,done:{1:1,2:1,3:1,4:1,5:1,6:1,7:1,8:1,9:1,10:1,11:1,12:1,13:1,14:1,15:1},quiz:{},solved:{},games:{},tries:{},gym:{}}))"); pg.reload(); pg.wait_for_timeout(1500)
    bad=[]
    for ch in range(1,17):
        pg.evaluate(f"location.hash='#ch-{ch}'"); pg.wait_for_timeout(400)
        if ch==6: pg.locator('.story').screenshot(path=R+'/shots/story6.png')
        n=pg.evaluate(f"PRACTICE[{ch}].length")
        for i in range(n):
            pg.click(f'.pc[data-i="{i}"] .pc-head'); pg.wait_for_timeout(60)
            pg.click(f'.pc[data-i="{i}"] [data-a="check"]'); pg.wait_for_timeout(60)
            if 'Correct' in pg.inner_text(f'.pc[data-i="{i}"] .pc-msg'): bad.append((ch,i,'empty passed'))
            sol=pg.evaluate(f"PRACTICE[{ch}][{i}].sol"); pg.fill(f'.pc[data-i="{i}"] .pc-ed', sol)
            pg.click(f'.pc[data-i="{i}"] [data-a="check"]'); pg.wait_for_timeout(120)
            m=pg.inner_text(f'.pc[data-i="{i}"] .pc-msg')
            if 'Correct' not in m: bad.append((ch,i,m[:90]))
            if ch==3 and i==2: pg.locator(f'.pc[data-i="{i}"]').screenshot(path=R+'/shots/practice_open.png')
        # skills check: answer all but the first sql item correctly
        pg.click('#ckStart'); pg.wait_for_timeout(150)
        items=pg.evaluate(f"CHECK[{ch}]")
        for i,it in enumerate(items):
            sel=f'.ck-item[data-i="{i}"]'
            if it['type']=='mcq': pg.click(f'{sel} .opt[data-j="{it["a"] if i!=len(items)-1 else (it["a"]+1)%len(it["opts"])}"]')
            else:
                if i==0 and ch==5: pg.click(f'{sel} [data-a="skip"]'); continue
                pg.fill(f'{sel} .ck-ed', it['sol']); pg.click(f'{sel} [data-a="submit"]'); pg.wait_for_timeout(120)
                if '✅' not in pg.inner_text(f'{sel} .ck-msg'): bad.append((ch,'check',i,pg.inner_text(f'{sel} .ck-msg')[:80]))
        pg.click('#ckFinish'); pg.wait_for_timeout(300)
        if ch==5: pg.locator('#skillcheck').screenshot(path=R+'/shots/report5.png')
    pg.evaluate("location.hash='#home'"); pg.wait_for_timeout(2800)
    pg.screenshot(path=R+'/shots/home_profile.png',full_page=True)
    print('issues',bad); print('ERRS',errs[:5])
    print('saved', pg.evaluate("(()=>{const s=JSON.parse(localStorage.getItem('sqlquest-v1'));return [Object.keys(s.prac).length, Object.keys(s.skill).length]})()"))
    b.close()
