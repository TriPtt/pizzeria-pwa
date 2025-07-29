-- 🗑️ NETTOYAGE
DELETE FROM products;

-- 🔄 RESET de l'auto-increment (optionnel)
ALTER SEQUENCE products_id_seq RESTART WITH 1;

-- 🍕 PIZZAS (images variées)
INSERT INTO products (name, description, price, type, image, vegetarian) VALUES
('Margherita', 'Sauce tomate, mozzarella, basilic frais', 12.50, 'pizza', 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&h=400&fit=crop', true),
('Regina', 'Sauce tomate, mozzarella, jambon, champignons', 14.00, 'pizza', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=400&fit=crop', false),
('4 Fromages', 'Mozzarella, gorgonzola, parmesan, chèvre', 15.50, 'pizza', 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&h=400&fit=crop', true),
('Pepperoni', 'Sauce tomate, mozzarella, pepperoni piquant', 13.50, 'pizza', 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=800&h=400&fit=crop', false),
('Végétarienne', 'Sauce tomate, mozzarella, poivrons, courgettes, aubergines', 13.00, 'pizza', 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=800&h=400&fit=crop', true),
('Calzone', 'Pizza fermée: jambon, ricotta, épinards', 14.50, 'pizza', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=400&fit=crop', false),
('Napolitaine', 'Sauce tomate, mozzarella, anchois, câpres, olives', 13.80, 'pizza', 'https://images.unsplash.com/photo-1595708684082-a173bb3a06c5?w=800&h=400&fit=crop', false),
('Chorizo', 'Sauce tomate, mozzarella, chorizo, poivrons', 14.20, 'pizza', 'https://images.unsplash.com/photo-1506280754576-f6fa8a873550?w=800&h=400&fit=crop', false);

-- 🥤 BOISSONS (images variées)
INSERT INTO products (name, description, price, type, image, vegetarian) VALUES
('Coca-Cola 33cl', 'Boisson gazeuse sucrée', 2.50, 'boisson', 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400&h=400&fit=crop', true),
('Coca-Cola Zero 33cl', 'Boisson gazeuse sans sucre', 2.50, 'boisson', 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400&h=400&fit=crop', true),
('Sprite 33cl', 'Boisson gazeuse citron-lime', 2.50, 'boisson', 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400&h=400&fit=crop', true),
('Fanta Orange 33cl', 'Boisson gazeuse à l''orange', 2.50, 'boisson', 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400&h=400&fit=crop', true),
('Eau plate 50cl', 'Eau de source naturelle', 1.80, 'boisson', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop', true),
('Eau pétillante 50cl', 'Eau gazeuse naturelle', 1.80, 'boisson', 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400&h=400&fit=crop', true),
('Jus d''orange 25cl', 'Pur jus d''orange pressée', 3.20, 'boisson', 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=400&fit=crop', true),
('Bière artisanale 33cl', 'Bière blonde locale', 4.50, 'boisson', 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&h=400&fit=crop', true);

-- 🍰 DESSERTS
INSERT INTO products (name, description, price, type, image, vegetarian) VALUES
('Tiramisu', 'Mascarpone, café, cacao, biscuits', 5.50, 'dessert', 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop', true),
('Panna Cotta', 'Crème vanille, coulis de fruits rouges', 4.80, 'dessert', 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop', true),
('Cannoli Siciliens', 'Tubes croustillants, ricotta sucrée', 6.00, 'dessert', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop', true),
('Gelato 3 boules', 'Glace artisanale (vanille, chocolat, pistache)', 4.20, 'dessert', 'https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?w=400&h=300&fit=crop', true),
('Tarte aux pommes', 'Pâte maison, pommes caramélisées', 5.00, 'dessert', 'https://images.unsplash.com/photo-1621743478914-cc8a86d7e7b5?w=400&h=300&fit=crop', true),
('Brownie chocolat', 'Fondant au chocolat, noix de pécan', 4.50, 'dessert', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop', true);
