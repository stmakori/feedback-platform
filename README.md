# Feedback Platform

Multi-tenant client feedback MVP built with Rails 8, PostgreSQL, Devise, Hotwire, Active Storage, Redis, and Sidekiq.

## Setup

Install Ruby 3.4, PostgreSQL, and Redis. Then run:

```bash
bundle install
cp .env.example .env
bin/rails db:setup
bin/dev
bundle exec sidekiq
```

In development, invitation emails are written to `tmp/mails` unless SMTP variables are exported in the shell. For real delivery, export `SMTP_ADDRESS`, `SMTP_PORT`, `SMTP_DOMAIN`, `SMTP_USERNAME`, and `SMTP_PASSWORD`, then restart Rails and Sidekiq.

Create an admin workspace at `/signup`. Admins can add clients and queue invitations; invited clients can set a password and submit text or photo feedback.

Every admin lookup is scoped through `Current.business`, and client feedback is scoped through the authenticated client association.
# README

This README would normally document whatever steps are necessary to get the
application up and running.

Things you may want to cover:

* Ruby version

* System dependencies

* Configuration

* Database creation

* Database initialization

* How to run the test suite

* Services (job queues, cache servers, search engines, etc.)

* Deployment instructions

* ...
