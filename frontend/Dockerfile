FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

#serve
FROM node:20-alpine
WORKDIR /app
RUN npm install -g serve

#copy dist
COPY --from=build /app/dist /app/dist

EXPOSE 3000
#port300
CMD ["serve","-s","dist","-l","3000"]