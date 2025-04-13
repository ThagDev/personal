Deployed to production. Run `vercel --prod` to overwrite later (https://vercel.link/2F).
vercel .

if you didn't login
vercel login

nest g module <module-name>

nest g controller <controller-name>

nest g controller <controller-name> --no-spec (--no-spec file test )

nest g service <service-name>

// create all Module, Controller và Service
nest g resource <resource-name>

== vercel.json
{
"version": 2,
"builds": [
{
"src": "src/main.ts",
"use": "@vercel/node"

    }

],
"routes": [
{
"src": "/(.\*)",
"dest": "src/main.ts",
"methods": ["GET", "POST", "PUT", "DELETE"]
}
]
}




{
  "version": 2,
  "functions": {
    "src/main.ts": {
      "runtime": "nodejs18.x",
      "memory": 512,            
      "maxDuration": 10         
    }
  },
  "builds": [
    {
      "src": "src/main.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/main.ts"
    }
  ]
}
