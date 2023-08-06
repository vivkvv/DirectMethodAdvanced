# Stage 1: Build Nest.js application
FROM node:18 as nestjs-build
WORKDIR /app/DirectMethodNestJSServer/directmethod-server
COPY DirectMethodNestJSServer/directmethod-server/package*.json ./
RUN npm install
COPY DirectMethodNestJSServer/directmethod-server/ .
RUN npm run build

# Stage 2: Build angular part
WORKDIR /app/DirectMethodNestJSServer/directmethod-server/client
COPY DirectMethodAngularClient/direct-method-client/package*.json ./
RUN npm install
COPY DirectMethodAngularClient/direct-method-client/ ./
RUN npx ng build --configuration production

# 3. Copy built Angular static files to Nest.js public folder
RUN mkdir -p ../public/ && cp -r dist/direct-method-client/* ../public/

# Stage 4: Production image
FROM node:18-alpine
WORKDIR /app
COPY --from=nestjs-build /app/DirectMethodNestJSServer/directmethod-server/dist /app/dist
COPY --from=nestjs-build /app/DirectMethodNestJSServer/directmethod-server/node_modules /app/node_modules
COPY --from=nestjs-build /app/DirectMethodNestJSServer/directmethod-server/public /app/public
COPY --from=nestjs-build /app/DirectMethodNestJSServer/directmethod-server/package*.json ./

EXPOSE 3000
CMD ["npm", "run", "prod"]
