-- Script para restaurar produtos padrão caso a tabela esteja vazia
-- Execute este script no SQL Editor do Supabase

INSERT INTO products (name, description, category, unit_price, daily_rental_price, total_stock)
SELECT * FROM (VALUES
    ('Tenda Piramidal 3x3', 'Tenda branca 3x3m com calhas', 'Tendas', 1500.00, 150.00, 10),
    ('Tenda Piramidal 5x5', 'Tenda branca 5x5m reforçada', 'Tendas', 2500.00, 250.00, 5),
    ('Tenda Sanfonada 3x3', 'Tenda montagem rápida', 'Tendas', 800.00, 100.00, 15),
    ('Palco 4x4m', 'Palco modular com carpete', 'Palcos', 5000.00, 500.00, 2),
    ('Grade de Isolamento', 'Grade de ferro 2m', 'Estruturas', 200.00, 20.00, 50),
    ('Andaime Tubular 1.0m', 'Painel de andaime 1.0x1.0m', 'Estruturas', 150.00, 10.00, 40),
    ('Mesa Plástica', 'Mesa quadrada branca', 'Mesas e Cadeiras', 80.00, 8.00, 100),
    ('Cadeira Plástica', 'Cadeira branca sem braço', 'Mesas e Cadeiras', 40.00, 4.00, 400),
    ('Escada Extensiva 7m', 'Escada de alumínio', 'Escadas', 600.00, 40.00, 3),
    ('Holofote LED 100W', 'Refletor para iluminação', 'Acessórios', 120.00, 15.00, 20)
) AS v(name, description, category, unit_price, daily_rental_price, total_stock)
WHERE NOT EXISTS (
    SELECT 1 FROM products WHERE name = v.name
);
