class CreateClients < ActiveRecord::Migration[8.1]
  def change
    create_table :clients do |t|
      t.references :business, null: false, foreign_key: true
      t.references :user, foreign_key: true
      t.string :name, null: false
      t.string :email, null: false
      t.string :phone
      t.string :invitation_token_digest
      t.datetime :invitation_sent_at
      t.datetime :invitation_accepted_at
      t.datetime :invitation_expires_at
      t.timestamps
    end
    add_index :clients, [ :business_id, :email ], unique: true
    add_index :clients, :user_id, unique: true, name: "index_clients_on_user_id_unique"
    add_index :clients, :invitation_token_digest, unique: true
  end
end
