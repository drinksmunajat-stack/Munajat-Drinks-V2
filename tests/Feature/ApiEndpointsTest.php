<?php

use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('api ping returns ok', function () {
    $response = $this->getJson('/api/ping');
    $response->assertStatus(200)
        ->assertJson(['status' => 'ok']);
});

test('users crud api works', function () {
    // 1. Get List
    $list = $this->getJson('/api/users');
    $list->assertStatus(200)->assertJson(['success' => true]);

    // 2. Create
    $create = $this->postJson('/api/users', [
        'name' => 'Tester User',
        'email' => 'tester.'.time().'@example.com',
        'role' => 'Kasir',
        'branch' => 'Pusat',
        'status' => 'Aktif',
    ]);
    $create->assertStatus(201);
    $userId = $create->json('data.id');

    // 3. Update
    $update = $this->putJson("/api/users/{$userId}", [
        'name' => 'Tester User Updated',
        'email' => $create->json('data.email'),
        'role' => 'Kasir',
        'branch' => 'Pusat',
        'status' => 'Aktif',
    ]);
    $update->assertStatus(200)->assertJsonPath('data.name', 'Tester User Updated');

    // 4. Delete
    $delete = $this->deleteJson("/api/users/{$userId}");
    $delete->assertStatus(200);
});

test('toppings crud api works', function () {
    $create = $this->postJson('/api/toppings', [
        'name' => 'Coconut Flakes Test '.time(),
        'category' => 'Crunch',
        'price' => 4500,
        'stock' => 50,
        'is_available' => true,
    ]);
    $create->assertStatus(201);
    $id = $create->json('data.id');

    $update = $this->putJson("/api/toppings/{$id}", [
        'price' => 5500,
    ]);
    $update->assertStatus(200);

    $delete = $this->deleteJson("/api/toppings/{$id}");
    $delete->assertStatus(200);
});

test('products crud api works', function () {
    $create = $this->postJson('/api/products', [
        'name' => 'Signature Blend Coffee '.time(),
        'category' => 'Kopi',
        'price' => 35000,
        'stock' => 80,
    ]);
    $create->assertStatus(201);
    $id = $create->json('data.id');

    $update = $this->putJson("/api/products/{$id}", [
        'price' => 38000,
    ]);
    $update->assertStatus(200);

    $delete = $this->deleteJson("/api/products/{$id}");
    $delete->assertStatus(200);
});

test('ai settings api works', function () {
    $get = $this->getJson('/api/ai-settings?provider=gemini');
    $get->assertStatus(200)->assertJson(['success' => true]);

    $save = $this->postJson('/api/ai-settings', [
        'provider' => 'gemini',
        'model' => 'gemini-1.5-flash',
        'temperature' => 0.8,
        'voice_persona' => 'Kasir Cerdas',
    ]);
    $save->assertStatus(200)->assertJson(['success' => true]);
});

test('stats summary api works', function () {
    $res = $this->getJson('/api/stats/summary');
    $res->assertStatus(200)
        ->assertJson(['success' => true])
        ->assertJsonStructure([
            'success',
            'data' => [
                'orders_count',
                'total_revenue',
                'rating',
                'users_count',
                'products_count',
                'cabangs_count',
            ],
        ]);
});
