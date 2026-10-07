<div align="center">

# Jenkins CI/CD Demo Project

### CI/CD pipeline для Node.js-приложения с использованием Jenkins и Docker

Учебный DevOps-проект, демонстрирующий полный цикл автоматической сборки, тестирования и развёртывания приложения с помощью **Jenkins Pipeline**, **Docker** и **Docker-in-Docker**.

![Node.js](https://img.shields.io/badge/Node.js-18-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.18.2-000000?logo=express&logoColor=white)
![Jenkins](https://img.shields.io/badge/Jenkins-LTS-D24939?logo=jenkins&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?logo=docker&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-29.7.0-C21325?logo=jest&logoColor=white)
![Supertest](https://img.shields.io/badge/Supertest-6.3.3-333333)

</div>

---

## О проекте

Проект создан для демонстрации построения простого **CI/CD-процесса** с использованием Jenkins.

В качестве тестового приложения используется небольшой REST-сервис на **Node.js + Express**.

Основная задача проекта — организовать автоматический процесс:

```text
Получение исходного кода
        ↓
Сборка Docker-образа
        ↓
Запуск автоматических тестов
        ↓
Развёртывание приложения
```

Для выполнения Docker-команд Jenkins взаимодействует с отдельным контейнером **Docker-in-Docker (DinD)**.

В результате Jenkins самостоятельно:

- получает исходный код проекта;
- собирает новый Docker-образ;
- запускает тесты внутри контейнера;
- останавливает предыдущую версию приложения;
- запускает новый контейнер приложения.

---

# Архитектура проекта

Общая схема взаимодействия компонентов:

```text
             Git Repository
                   │
                   ▼
              Jenkins
                   │
                   │ DOCKER_HOST
                   ▼
          Docker-in-Docker
                   │
         ┌─────────┴─────────┐
         │                   │
         ▼                   ▼
   Build image          Run tests
         │
         ▼
      Deploy
         │
         ▼
 Node.js Application
      port 3000
```

Jenkins и Docker daemon запускаются в отдельных контейнерах и находятся в общей Docker-сети.

---

# CI/CD Pipeline

Pipeline описан декларативно в файле:

```text
Jenkinsfile
```

Он состоит из четырёх основных этапов:

```text
Checkout
   ↓
Build
   ↓
Test
   ↓
Deploy
```

---

## 1. Checkout

На первом этапе Jenkins получает исходный код проекта:

```groovy
checkout scm
```

Дополнительно выполняется проверка рабочего каталога и наличия `Dockerfile`.

```text
Repository
    ↓
Jenkins Workspace
```

Этот этап подготавливает исходный код для дальнейшей сборки.

---

## 2. Build

На этапе `Build` Jenkins подключается к Docker daemon:

```text
tcp://dind:2375
```

После этого собирается Docker-образ приложения:

```bash
docker build --no-cache \
    -t devops-jetkins-app:${BUILD_NUMBER} .
```

Каждая сборка получает собственный тег, соответствующий номеру Jenkins build:

```text
devops-jetkins-app:1
devops-jetkins-app:2
devops-jetkins-app:3
...
```

Также создаётся тег:

```text
latest
```

Таким образом можно отличать отдельные версии приложения и одновременно иметь ссылку на последнюю сборку.

---

## 3. Test

После успешной сборки Jenkins запускает новый контейнер на основе созданного image:

```bash
docker run --rm \
    devops-jetkins-app:${BUILD_NUMBER} \
    npm test
```

Тесты выполняются непосредственно внутри Docker-контейнера.

```text
Docker Image
     ↓
Temporary Test Container
     ↓
npm test
     ↓
Jest
     ↓
Tests passed / failed
```

После завершения тестирования временный контейнер автоматически удаляется благодаря параметру:

```text
--rm
```

Если тесты завершаются с ошибкой, pipeline останавливается и этап `Deploy` не выполняется.

---

## 4. Deploy

После успешного прохождения тестов Jenkins переходит к развёртыванию новой версии приложения.

Сначала предыдущий контейнер останавливается:

```bash
docker stop devops-jetkins-app-deploy
```

и удаляется:

```bash
docker rm devops-jetkins-app-deploy
```

После этого запускается новая версия:

```bash
docker run -d \
    --name devops-jetkins-app-deploy \
    -p 3000:3000 \
    devops-jetkins-app:${BUILD_NUMBER}
```

Итоговый процесс:

```text
Old container
      ↓
     STOP
      ↓
    REMOVE
      ↓
New Docker image
      ↓
New container
      ↓
Application :3000
```

---

# Технологический стек

| Технология | Назначение |
|---|---|
| **Node.js 18** | среда выполнения приложения |
| **Express 4.18.2** | HTTP-сервер и REST API |
| **Jenkins LTS** | CI/CD automation server |
| **Docker** | контейнеризация приложения |
| **Docker Compose** | запуск Jenkins и DinD инфраструктуры |
| **Docker-in-Docker** | отдельный Docker daemon для Jenkins |
| **Jest 29.7.0** | unit testing |
| **Supertest 6.3.3** | тестирование HTTP API |
| **JavaScript** | язык приложения и тестов |

---

# Структура проекта

```text
Jettkins2Project/
│
├── app.js
├── package.json
├── jest.config.js
│
├── utils/
│   └── calculator.js
│
├── tests/
│   ├── app.test.js
│   └── calculator.test.js
│
├── Dockerfile
├── Dockerfile.jenkins
├── Dockerfile.dind
├── docker-compose.yml
│
├── Jenkinsfile
│
├── .dockerignore
└── .gitignore
```

---

# Node.js приложение

В основе проекта находится простой Express-сервис.

Приложение по умолчанию запускается на:

```text
http://localhost:3000
```

Порт может быть изменён через environment variable:

```text
PORT
```

Если переменная не указана, используется:

```javascript
const PORT = process.env.PORT || 3000;
```

---

# API

В приложении реализовано три endpoint.

| Method | Endpoint | Назначение |
|---|---|---|
| `GET` | `/` | главная HTML-страница |
| `POST` | `/api/calculate` | вычисление суммы двух чисел |
| `GET` | `/health` | проверка состояния приложения |

---

## GET `/`

Возвращает HTML-страницу приложения.

Пример:

```http
GET /
```

Страница содержит сообщение:

```text
CI/CD работает! Изменения применены автоматически!
```

и информацию о приложении.

---

## POST `/api/calculate`

Выполняет сложение двух чисел.

Запрос:

```http
POST /api/calculate
Content-Type: application/json
```

```json
{
  "a": 5,
  "b": 3
}
```

Ответ:

```json
{
  "a": 5,
  "b": 3,
  "result": 8
}
```

---

### Валидация данных

Оба параметра должны иметь тип `number`.

Некорректный запрос:

```json
{
  "a": "5",
  "b": 3
}
```

возвращает:

```http
400 Bad Request
```

с сообщением об ошибке.

---

## GET `/health`

Health check endpoint используется для проверки состояния приложения.

Запрос:

```http
GET /health
```

Пример ответа:

```json
{
  "status": "ok",
  "timestamp": "2026-01-01T12:00:00.000Z"
}
```

Endpoint может использоваться для мониторинга доступности сервиса.

---

# Автоматические тесты

Тестирование реализовано с использованием:

```text
Jest
+
Supertest
```

Тесты находятся в директории:

```text
tests/
```

и автоматически находятся Jest благодаря конфигурации:

```javascript
testMatch: [
    '**/tests/**/*.test.js'
]
```

---

## API tests

Файл:

```text
tests/app.test.js
```

проверяет HTTP-интерфейс приложения.

Реализованы проверки:

| Проверка | Ожидаемый результат |
|---|---|
| `GET /` | HTTP `200` |
| Главная страница | содержит название приложения |
| Главная страница | содержит CI/CD greeting |
| `POST /api/calculate` | корректно складывает числа |
| Некорректные типы | возвращается HTTP `400` |
| `GET /health` | возвращает HTTP `200` |
| Health check | `status = ok` |
| Health check | присутствует timestamp |

---

# Unit tests

Файл:

```text
tests/calculator.test.js
```

проверяет бизнес-логику приложения отдельно от HTTP API.

Тестируется функция:

```javascript
calculateSum(a, b)
```

Для неё проверяются:

- положительные числа;
- отрицательные числа;
- положительное и отрицательное число;
- работа с нулём;
- числа с плавающей точкой;
- некорректные типы данных.

Например:

```javascript
expect(calculateSum(2, 3)).toBe(5);
```

Для floating-point значений используется:

```javascript
expect(calculateSum(0.1, 0.2)).toBeCloseTo(0.3);
```

Также тестируется функция:

```javascript
getGreeting()
```

---

# Запуск приложения локально

## Требования

Для запуска без Docker необходимы:

- Node.js;
- npm.

Рекомендуется использовать Node.js 18, поскольку именно эта версия используется внутри Docker-контейнера проекта.

---

## Клонирование

```bash
git clone https://github.com/kemuri-ni-deteitta/Jettkins2Project.git
```

Перейти в директорию проекта:

```bash
cd Jettkins2Project
```

Установить зависимости:

```bash
npm install
```

Запустить приложение:

```bash
npm start
```

После запуска приложение будет доступно по адресу:

```text
http://localhost:3000
```

---

# Запуск тестов локально

Запустить все тесты:

```bash
npm test
```

Для запуска Jest в watch mode:

```bash
npm run test:watch
```

---

# Запуск приложения через Docker

Собрать Docker-образ:

```bash
docker build -t devops-jetkins-app .
```

Запустить контейнер:

```bash
docker run -d \
    --name devops-jetkins-app \
    -p 3000:3000 \
    devops-jetkins-app
```

После запуска:

```text
http://localhost:3000
```

---

# Dockerfile приложения

Основной `Dockerfile` использует:

```dockerfile
FROM node:18-alpine
```

Рабочая директория:

```text
/app
```

Процесс сборки:

```text
node:18-alpine
      ↓
WORKDIR /app
      ↓
COPY package*.json
      ↓
npm install
      ↓
COPY source code
      ↓
EXPOSE 3000
      ↓
npm start
```

Использование Alpine-образа позволяет сохранить базовый Docker image относительно компактным.

---

# Jenkins и Docker-in-Docker

Для CI/CD инфраструктуры используются два отдельных контейнера:

```text
jenkins
dind
```

Они создаются через:

```text
docker-compose.yml
```

---

## Jenkins container

Jenkins собирается из:

```text
Dockerfile.jenkins
```

Базовый image:

```dockerfile
FROM jenkins/jenkins:lts
```

В контейнер дополнительно устанавливаются:

- Docker Engine;
- Docker CLI;
- containerd.

Это позволяет Jenkins выполнять команды:

```bash
docker build
docker run
docker stop
docker rm
```

---

## Docker-in-Docker

Второй контейнер создаётся на основе:

```dockerfile
FROM docker:dind
```

Он предоставляет отдельный Docker daemon.

Jenkins подключается к нему через:

```text
DOCKER_HOST=tcp://dind:2375
```

Связь работает благодаря общей Docker-сети:

```text
jenkins-network
```

Схема:

```text
Jenkins Container
       │
       │ TCP :2375
       ▼
Docker DinD Container
       │
       ├── Build images
       │
       ├── Run tests
       │
       └── Deploy application
```

---

# Запуск CI/CD инфраструктуры

Собрать и запустить Jenkins и DinD:

```bash
docker compose up -d --build
```

Проверить запущенные контейнеры:

```bash
docker compose ps
```

После запуска Jenkins доступен по адресу:

```text
http://localhost:8080
```

---

# Docker Compose инфраструктура

`docker-compose.yml` создаёт:

```text
Jenkins
    │
    ├── port 8080
    ├── port 50000
    │
    └── jenkins_home
         
Docker DinD
    │
    ├── port 2375
    │
    └── docker_data

        │
        ▼

jenkins-network
```

Используются два persistent volume:

```text
jenkins_home
docker_data
```

### `jenkins_home`

Хранит данные Jenkins:

- конфигурацию;
- pipeline jobs;
- plugins;
- build history;
- Jenkins settings.

### `docker_data`

Хранит данные Docker daemon:

- images;
- containers;
- layers.

Благодаря volumes данные не исчезают при пересоздании контейнеров.

---

# Переменные Jenkins Pipeline

В `Jenkinsfile` определены следующие переменные:

```groovy
environment {
    DOCKER_IMAGE = 'devops-jetkins-app'
    DOCKER_TAG = "${env.BUILD_NUMBER}"
    DOCKER_HOST = 'tcp://dind:2375'
}
```

| Переменная | Значение | Назначение |
|---|---|---|
| `DOCKER_IMAGE` | `devops-jetkins-app` | имя Docker image |
| `DOCKER_TAG` | `BUILD_NUMBER` | версия image |
| `DOCKER_HOST` | `tcp://dind:2375` | адрес Docker daemon |

---

# Версионирование Docker images

Для каждого Jenkins build создаётся отдельная версия:

```text
Build #1
    ↓
devops-jetkins-app:1

Build #2
    ↓
devops-jetkins-app:2

Build #3
    ↓
devops-jetkins-app:3
```

Дополнительно последняя версия получает тег:

```text
latest
```

Это позволяет связать конкретный Docker image с конкретным запуском Jenkins Pipeline.

---

# Полный CI/CD процесс

Общий жизненный цикл изменений выглядит следующим образом:

```text
Developer
    │
    ▼
Git Repository
    │
    ▼
Jenkins
    │
    ├── Checkout
    │
    ▼
Docker Build
    │
    ▼
Docker Image
    │
    ├── npm test
    │      │
    │      ├── Jest
    │      └── Supertest
    │
    ▼
Tests passed?
    │
    ├── NO ──────> Pipeline failed
    │
    └── YES
          │
          ▼
    Stop old container
          │
          ▼
    Remove old container
          │
          ▼
    Start new container
          │
          ▼
       Deploy
          │
          ▼
 localhost:3000
```

---

# Обработка результата Pipeline

После завершения pipeline Jenkins выполняет соответствующий `post` block.

Успешная сборка:

```text
Pipeline completed successfully!
```

Ошибка:

```text
Pipeline failed!
```

Таким образом результат всего процесса явно отображается в Jenkins build.

---

# Особенности реализации

В проекте реализованы:

- Jenkins Declarative Pipeline;
- разделение pipeline на `Checkout`, `Build`, `Test` и `Deploy`;
- контейнеризация Node.js-приложения;
- собственный Jenkins Docker image;
- отдельный Docker-in-Docker daemon;
- Docker Compose инфраструктура;
- автоматическая сборка Docker image;
- тегирование image номером Jenkins build;
- автоматический запуск Jest-тестов внутри контейнера;
- unit tests;
- API integration tests;
- автоматическая остановка предыдущей версии приложения;
- автоматическое развёртывание нового контейнера;
- persistent volumes для Jenkins и Docker;
- health check API приложения.

---

# Основная идея проекта

Проект демонстрирует переход от ручного процесса:

```text
изменить код
→ собрать приложение
→ запустить тесты
→ создать Docker image
→ остановить старую версию
→ запустить новую
```

к автоматизированному процессу:

```text
Code
  ↓
Jenkins Pipeline
  ↓
Build
  ↓
Test
  ↓
Deploy
```

Основная цель — показать практическую работу базовых CI/CD-принципов и взаимодействие нескольких DevOps-инструментов в единой инфраструктуре.

---

<div align="center">

### CI/CD Pipeline

**Jenkins · Docker · Docker-in-Docker · Node.js · Jest · Supertest**

</div>
