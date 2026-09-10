class CreateFeedbacks < ActiveRecord::Migration[8.1]
  def change
    create_table :feedbacks do |t|
      t.references :client, null: false, foreign_key: true
      t.references :business, null: false, foreign_key: true
      t.text :body

      t.timestamps
    end
    add_index :feedbacks, [:business_id, :created_at]
    add_index :feedbacks, [:client_id, :created_at]
  end
end
