FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./
COPY backend/database/prisma/schema.prisma ./prisma/schema.prisma
RUN npx prisma generate
RUN mkdir -p public/uploads/articles
ENV PORT=3001
ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "server.js"]
