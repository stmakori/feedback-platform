# Be sure to restart your server when you modify this file.

# Version of your assets, change this if you want to expire all your assets.
Rails.application.config.assets.version = "1.0"
Rails.application.config.assets.paths << Rails.root.join("app/assets/builds")

# Add additional assets to the asset load path.
# Rails.application.config.assets.paths << Emoji.images_path

# Tailwind v4 output uses modern CSS (e.g. `@media (width >= 40rem)`) that the SassC compressor
# pulled in by sassc-rails for RailsAdmin cannot parse; Tailwind already ships minified CSS.
Rails.application.config.assets.css_compressor = nil
