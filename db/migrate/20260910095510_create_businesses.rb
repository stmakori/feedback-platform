class CreateBusinesses < ActiveRecord::Migration[8.1]
  def change
    create_table :businesses do |t|
      t.string :name
      t.string :email, null: false

      t.timestamps
    end
    add_index :businesses, :email, unique: true
  end
end
