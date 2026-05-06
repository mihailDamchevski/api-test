FROM mcr.microsoft.com/playwright:v1.59.1-noble

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ENV BASE_URL=https://fakerestapi.azurewebsites.net

CMD ["npx", "playwright", "test"]
