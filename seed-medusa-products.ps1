# seed-medusa-products.ps1
# Limpia productos de prueba y agrega el catálogo completo de joyería Moncatu a Medusa.
# Uso: .\seed-medusa-products.ps1
# Requiere: Medusa corriendo en http://localhost:9000

$BASE = "https://moncatu-backend-production.up.railway.app"
$PK   = "pk_9808c180ac40289f88a7f050264eb6e61b06d2a0daf0a0234bfc9c28e575f69e"
$HEADERS = @{
    "Content-Type"           = "application/json"
    "x-publishable-api-key"  = $PK
}

# Necesitamos token de admin para crear/borrar productos
# Primero obtenemos token admin
Write-Host "[0] Obteniendo token admin..." -ForegroundColor Cyan
$loginBody = '{"email":"owner@moncatu.com","password":"Moncatu2024!"}'
try {
    $loginRes = Invoke-RestMethod -Uri "$BASE/auth/user/emailpass" -Method POST -ContentType "application/json" -Body $loginBody
    $TOKEN = $loginRes.token
    Write-Host "    Token OK" -ForegroundColor Green
} catch {
    Write-Host "Error login admin: $_" -ForegroundColor Red
    Write-Host "Intentando con credenciales alternativas..." -ForegroundColor Yellow
    $loginBody2 = '{"email":"admin@medusa-test.com","password":"supersecret"}'
    try {
        $loginRes2 = Invoke-RestMethod -Uri "$BASE/auth/user/emailpass" -Method POST -ContentType "application/json" -Body $loginBody2
        $TOKEN = $loginRes2.token
        Write-Host "    Token OK (medusa-test)" -ForegroundColor Green
    } catch {
        Write-Error "No se pudo obtener token admin. Verifica que Medusa esté corriendo y las credenciales."
        exit 1
    }
}

$ADMIN_HEADERS = @{
    "Content-Type"  = "application/json"
    "Authorization" = "Bearer $TOKEN"
}

# ─── Obtener región MXN ───────────────────────────────────────────────
Write-Host "[1] Obteniendo región MXN..." -ForegroundColor Cyan
$regions = Invoke-RestMethod -Uri "$BASE/admin/regions?limit=50" -Method GET -Headers $ADMIN_HEADERS
$mxnRegion = $regions.regions | Where-Object { $_.currency_code -eq "mxn" } | Select-Object -First 1
if (-not $mxnRegion) {
    Write-Host "    No hay región MXN. Creando..." -ForegroundColor Yellow
    $regionBody = @{
        name          = "México"
        currency_code = "mxn"
        countries     = @("mx")
    } | ConvertTo-Json -Depth 3
    $mxnRegion = (Invoke-RestMethod -Uri "$BASE/admin/regions" -Method POST -Headers $ADMIN_HEADERS -Body $regionBody).region
    Write-Host "    Región MXN creada: $($mxnRegion.id)" -ForegroundColor Green
} else {
    Write-Host "    Región MXN existente: $($mxnRegion.id)" -ForegroundColor Green
}

# ─── Obtener o crear sales channel ────────────────────────────────────
Write-Host "[2] Obteniendo sales channel..." -ForegroundColor Cyan
$channels = Invoke-RestMethod -Uri "$BASE/admin/sales-channels?limit=10" -Method GET -Headers $ADMIN_HEADERS
$channel = $channels.sales_channels | Select-Object -First 1
Write-Host "    Canal: $($channel.name) ($($channel.id))" -ForegroundColor Green

# ─── Borrar productos de prueba/demo ──────────────────────────────────
Write-Host "[3] Limpiando productos demo/prueba de Medusa..." -ForegroundColor Cyan
$allProds = Invoke-RestMethod -Uri "$BASE/admin/products?limit=50" -Method GET -Headers $ADMIN_HEADERS
$toDelete = $allProds.products | Where-Object {
    $_.handle -in @("ewdwe", "t-shirt", "sweatshirt", "sweatpants", "shorts")
}
foreach ($p in $toDelete) {
    Write-Host "    Borrando: $($p.title) ($($p.id))" -ForegroundColor Yellow
    try {
        Invoke-RestMethod -Uri "$BASE/admin/products/$($p.id)" -Method DELETE -Headers $ADMIN_HEADERS | Out-Null
        Write-Host "    ✓ Borrado" -ForegroundColor Green
    } catch {
        Write-Host "    Error borrando: $_" -ForegroundColor Red
    }
}

# ─── Catálogo de joyería Moncatu ──────────────────────────────────────
$IMG = "https://vonoaweb.github.io/moncatu-web/img"

$PRODUCTS = @(
    @{
        title       = "Anillo Constelación"
        handle      = "ring-constelacion"
        description = "Obra de arte que llevas en el dedo. Zafiros azules dispuestos en el patrón exacto de la constelación de Orión, engastados en plata .925 esterlina certificada."
        thumbnail   = "$IMG/ring_constelacion.png"
        images      = @(@{ url = "$IMG/ring_constelacion.png" })
        metadata    = @{ category="anillos"; material="Plata .925 esterlina"; stone="Zafiro natural certificado"; weight="5.2 g"; finish="Pulido alto brillo"; delivery="7–14 días hábiles"; featured="true"; limited="false"; exclusive="false" }
        variants    = @(
            @{ title="Talla 6"; prices=@(@{ currency_code="mxn"; amount=480000 }); options=@{ Talla="6" } }
            @{ title="Talla 7"; prices=@(@{ currency_code="mxn"; amount=480000 }); options=@{ Talla="7" } }
            @{ title="Talla 8"; prices=@(@{ currency_code="mxn"; amount=480000 }); options=@{ Talla="8" } }
        )
        options     = @(@{ title="Talla"; values=@("6","7","8") })
    },
    @{
        title       = "Anillo Aurora"
        handle      = "ring-aurora"
        description = "Banda elegante en plata .925 con turmalina rosa natural engastada al centro. Ideal para uso diario con un toque de color."
        thumbnail   = "$IMG/ring_aurora.png"
        images      = @(@{ url = "$IMG/ring_aurora.png" })
        metadata    = @{ category="anillos"; material="Plata .925 esterlina"; stone="Turmalina rosa natural"; weight="4.1 g"; finish="Satinado mate"; delivery="5–10 días hábiles"; featured="false"; limited="false"; exclusive="false" }
        variants    = @(
            @{ title="Talla 5"; prices=@(@{ currency_code="mxn"; amount=320000 }); options=@{ Talla="5" } }
            @{ title="Talla 6"; prices=@(@{ currency_code="mxn"; amount=320000 }); options=@{ Talla="6" } }
            @{ title="Talla 7"; prices=@(@{ currency_code="mxn"; amount=320000 }); options=@{ Talla="7" } }
            @{ title="Talla 8"; prices=@(@{ currency_code="mxn"; amount=320000 }); options=@{ Talla="8" } }
        )
        options     = @(@{ title="Talla"; values=@("5","6","7","8") })
    },
    @{
        title       = "Anillo Flor de Luna"
        handle      = "ring-flor-luna"
        description = "Diseño floral delicado con cuarzo rosa natural al centro, rodeado de pétalos en plata .925. Romántico y eterno."
        thumbnail   = "$IMG/ring_flor_luna.png"
        images      = @(@{ url = "$IMG/ring_flor_luna.png" })
        metadata    = @{ category="anillos"; material="Plata .925 esterlina"; stone="Cuarzo rosa natural"; weight="3.8 g"; finish="Pulido brillante"; delivery="5–10 días hábiles"; featured="false"; limited="false"; exclusive="false" }
        variants    = @(
            @{ title="Talla 5"; prices=@(@{ currency_code="mxn"; amount=240000 }); options=@{ Talla="5" } }
            @{ title="Talla 6"; prices=@(@{ currency_code="mxn"; amount=240000 }); options=@{ Talla="6" } }
            @{ title="Talla 7"; prices=@(@{ currency_code="mxn"; amount=240000 }); options=@{ Talla="7" } }
        )
        options     = @(@{ title="Talla"; values=@("5","6","7") })
    },
    @{
        title       = "Collar Luna"
        handle      = "necklace-luna"
        description = "Cadena fina ajustable con dije de cuarzo rosa en forma de luna. Delicado y versátil para usar solo o en capas."
        thumbnail   = "$IMG/necklace_luna.png"
        images      = @(@{ url = "$IMG/necklace_luna.png" })
        metadata    = @{ category="collares"; material="Plata .925 esterlina"; stone="Cuarzo rosa"; weight="3.2 g"; finish="Pulido brillante"; delivery="5–10 días hábiles"; featured="false"; limited="false"; exclusive="false" }
        variants    = @(
            @{ title="Única"; prices=@(@{ currency_code="mxn"; amount=220000 }); options=@{ Talla="Única" } }
        )
        options     = @(@{ title="Talla"; values=@("Única") })
    },
    @{
        title       = "Collar Noche Eterna"
        handle      = "necklace-noche"
        description = "Gargantilla statement con ónix negro tallado a mano. La oscuridad elegante para las que se atreven a brillar diferente."
        thumbnail   = "$IMG/necklace_noche.png"
        images      = @(@{ url = "$IMG/necklace_noche.png" })
        metadata    = @{ category="collares"; material="Plata .925 esterlina"; stone="Ónix negro tallado"; weight="8.5 g"; finish="Oxidado antique"; delivery="7–14 días hábiles"; featured="false"; limited="true"; exclusive="false" }
        variants    = @(
            @{ title="Única"; prices=@(@{ currency_code="mxn"; amount=440000 }); options=@{ Talla="Única" } }
        )
        options     = @(@{ title="Talla"; values=@("Única") })
    },
    @{
        title       = "Collar Cielo Abierto"
        handle      = "necklace-cielo"
        description = "Cadena fina con dije en forma de estrella. Minimalista y con personalidad, ideal para regalar o auto-regalarse."
        thumbnail   = "$IMG/necklace_cielo.png"
        images      = @(@{ url = "$IMG/necklace_cielo.png" })
        metadata    = @{ category="collares"; material="Plata .925 esterlina"; stone="—"; weight="2.6 g"; finish="Pulido brillante"; delivery="3–7 días hábiles"; featured="false"; limited="false"; exclusive="false" }
        variants    = @(
            @{ title="Única"; prices=@(@{ currency_code="mxn"; amount=190000 }); options=@{ Talla="Única" } }
        )
        options     = @(@{ title="Talla"; values=@("Única") })
    },
    @{
        title       = "Pulsera Estrella"
        handle      = "bracelet-estrella"
        description = "Cadena de eslabones finos con tres charms de estrellas en plata .925. Delicada y luminosa, perfecta para el día a día."
        thumbnail   = "$IMG/bracelet_estrella.png"
        images      = @(@{ url = "$IMG/bracelet_estrella.png" })
        metadata    = @{ category="pulseras"; material="Plata .925 esterlina"; stone="—"; weight="4.8 g"; finish="Pulido satinado"; delivery="3–7 días hábiles"; featured="false"; limited="false"; exclusive="false" }
        variants    = @(
            @{ title="Única"; prices=@(@{ currency_code="mxn"; amount=180000 }); options=@{ Talla="Única" } }
        )
        options     = @(@{ title="Talla"; values=@("Única") })
    },
    @{
        title       = "Pulsera Jade"
        handle      = "bracelet-jade"
        description = "Eslabones de plata .925 combinados con cuentas de jade verde natural. Equilibrio entre lo moderno y lo ancestral."
        thumbnail   = "$IMG/bracelet_jade.png"
        images      = @(@{ url = "$IMG/bracelet_jade.png" })
        metadata    = @{ category="pulseras"; material="Plata .925 + Jade"; stone="Jade verde natural"; weight="9.3 g"; finish="Natural pulido"; delivery="5–10 días hábiles"; featured="false"; limited="false"; exclusive="false" }
        variants    = @(
            @{ title="Única"; prices=@(@{ currency_code="mxn"; amount=360000 }); options=@{ Talla="Única" } }
        )
        options     = @(@{ title="Talla"; values=@("Única") })
    },
    @{
        title       = "Brazalete Dunas"
        handle      = "bracelet-dunas"
        description = "Brazalete rígido con textura orgánica inspirada en las dunas del desierto. Una escultura que llevas en la muñeca."
        thumbnail   = "$IMG/bracelet_dunas.png"
        images      = @(@{ url = "$IMG/bracelet_dunas.png" })
        metadata    = @{ category="pulseras"; material="Plata .925 esterlina"; stone="—"; weight="12.1 g"; finish="Martillado orgánico"; delivery="5–10 días hábiles"; featured="true"; limited="false"; exclusive="false" }
        variants    = @(
            @{ title="Única"; prices=@(@{ currency_code="mxn"; amount=290000 }); options=@{ Talla="Única" } }
        )
        options     = @(@{ title="Talla"; values=@("Única") })
    },
    @{
        title       = "Aretes Esmeralda"
        handle      = "earrings-esmeralda"
        description = "Aretes colgantes con esmeraldas colombianas certificadas en plata oxidada. Alta joyería con identidad latinoamericana."
        thumbnail   = "$IMG/earrings_esmeralda.png"
        images      = @(@{ url = "$IMG/earrings_esmeralda.png" })
        metadata    = @{ category="aretes"; material="Plata oxidada .925"; stone="Esmeralda colombiana"; weight="6.4 g"; finish="Oxidado artesanal"; delivery="7–14 días hábiles"; featured="true"; limited="false"; exclusive="true" }
        variants    = @(
            @{ title="Única"; prices=@(@{ currency_code="mxn"; amount=520000 }); options=@{ Talla="Única" } }
        )
        options     = @(@{ title="Talla"; values=@("Única") })
    },
    @{
        title       = "Aretes Pétalo"
        handle      = "earrings-petalo"
        description = "Aretes colgantes con cuarzo rosa tallado en forma de pétalo. Femeninos, románticos y con una caída perfecta."
        thumbnail   = "$IMG/earrings_petalo.png"
        images      = @(@{ url = "$IMG/earrings_petalo.png" })
        metadata    = @{ category="aretes"; material="Plata .925 esterlina"; stone="Cuarzo rosa natural"; weight="3.9 g"; finish="Pulido brillante"; delivery="5–10 días hábiles"; featured="false"; limited="false"; exclusive="false" }
        variants    = @(
            @{ title="Única"; prices=@(@{ currency_code="mxn"; amount=280000 }); options=@{ Talla="Única" } }
        )
        options     = @(@{ title="Talla"; values=@("Única") })
    },
    @{
        title       = "Aretes Cielo Nocturno"
        handle      = "earrings-cielo"
        description = "Studs minimalistas con zafiro azul en corte cabochon. Elegantes para cualquier ocasión, de día o de noche."
        thumbnail   = "$IMG/earrings_cielo.png"
        images      = @(@{ url = "$IMG/earrings_cielo.png" })
        metadata    = @{ category="aretes"; material="Plata .925 esterlina"; stone="Zafiro azul natural"; weight="2.8 g"; finish="Pulido alto brillo"; delivery="5–10 días hábiles"; featured="false"; limited="false"; exclusive="false" }
        variants    = @(
            @{ title="Única"; prices=@(@{ currency_code="mxn"; amount=310000 }); options=@{ Talla="Única" } }
        )
        options     = @(@{ title="Talla"; values=@("Única") })
    }
)

# ─── Crear productos ──────────────────────────────────────────────────
Write-Host "[4] Creando $($PRODUCTS.Count) productos de joyería..." -ForegroundColor Cyan

$existingProds = (Invoke-RestMethod -Uri "$BASE/admin/products?limit=100" -Method GET -Headers $ADMIN_HEADERS).products

$created = 0
$skipped = 0
foreach ($prod in $PRODUCTS) {
    $exists = $existingProds | Where-Object { $_.handle -eq $prod.handle }
    if ($exists) {
        Write-Host "    Skipping (ya existe): $($prod.title)" -ForegroundColor Gray
        $skipped++
        continue
    }

    $body = @{
        title        = $prod.title
        handle       = $prod.handle
        description  = $prod.description
        status       = "published"
        thumbnail    = $prod.thumbnail
        images       = $prod.images
        metadata     = $prod.metadata
        variants     = $prod.variants
        options      = $prod.options
        sales_channels = @(@{ id = $channel.id })
    } | ConvertTo-Json -Depth 10

    try {
        $res = Invoke-RestMethod -Uri "$BASE/admin/products" -Method POST -Headers $ADMIN_HEADERS -Body $body
        Write-Host "    ✓ Creado: $($prod.title) ($($res.product.id))" -ForegroundColor Green
        $created++
    } catch {
        $errMsg = $_.Exception.Response | ForEach-Object { $reader = [System.IO.StreamReader]::new($_.GetResponseStream()); $reader.ReadToEnd() }
        Write-Host "    ✗ Error en $($prod.title): $errMsg" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Resumen: $created creados, $skipped omitidos (ya existían)" -ForegroundColor Green
Write-Host "Abre: http://localhost:5500/colecciones.html" -ForegroundColor Green
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
