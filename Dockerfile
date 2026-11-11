FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn -q -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/multilingual-travel-guide-1.0.0.jar app.jar
RUN mkdir -p /app/storage/audio /app/storage/images /app/storage/packages
COPY storage/audio /app/storage/audio
COPY storage/images /app/storage/images
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
