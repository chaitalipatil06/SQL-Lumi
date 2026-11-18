import json
r=lambda p:open(p).read()
h=r('shell.html')
h=h.replace('/*CSS*/',r('style.css')).replace('/*SEED*/',json.dumps(r('seed.sql')+'\n'+r('clinic.sql'))).replace('/*CONTENT*/',r('content.js')+'\n'+r('content2.js')+'\n'+r('gym.js')+'\n'+r('practice.js')).replace('/*APP*/',r('app.js'))
open('../index.html','w').write(h); print(len(h))
