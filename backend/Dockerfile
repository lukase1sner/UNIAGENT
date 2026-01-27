# ---- Build Stage ----
FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /app

# Erst nur pom kopieren -> bessere Cache-Nutzung
COPY pom.xml .
RUN mvn -q -DskipTests dependency:go-offline

# Dann Source kopieren und bauen
COPY src ./src
RUN mvn -q -DskipTests package

# ---- Run Stage ----
FROM eclipse-temurin:17-jre
WORKDIR /app

# Jar aus dem Build Stage
COPY --from=build /app/target/*.jar app.jar

# Render liefert PORT env; Spring nutzt server.port=${PORT:8080}
ENV PORT=8080

CMD ["java", "-jar", "app.jar"]
