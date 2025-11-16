FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY server.js ./

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http=require('http');const options={hostname:'localhost',port:3001,path:'/health',timeout:2000};const req=http.get(options,(res)=>{if(res.statusCode===200){process.exit(0)}else{process.exit(1)}});req.on('error',()=>process.exit(1));req.on('timeout',()=>process.exit(1));"

CMD ["npm", "start"]
