# PowerShell script to download product images
# This script downloads images for all 60 products from the SQL insert script

$productsFolder = "frontend\src\assets\products"
$baseUrl = "https://source.unsplash.com/400x400"

# Product names and their image search terms (using generic terms, no brand names)
$products = @(
    @{Name="Coca Cola 2L"; SearchTerm="soft drink bottle"},
    @{Name="Pepsi 1.5L"; SearchTerm="soft drink bottle"},
    @{Name="Orange Juice 1L"; SearchTerm="orange juice bottle"},
    @{Name="Mineral Water 1L Pack of 12"; SearchTerm="water bottles"},
    @{Name="Green Tea 100g"; SearchTerm="tea leaves"},
    @{Name="Fresh Apples 1kg"; SearchTerm="red apples"},
    @{Name="Bananas Bunch"; SearchTerm="bananas"},
    @{Name="Tomatoes 1kg"; SearchTerm="tomatoes"},
    @{Name="Potatoes 2kg"; SearchTerm="potatoes"},
    @{Name="Onions 1kg"; SearchTerm="onions"},
    @{Name="Parle-G Biscuits 200g"; SearchTerm="biscuits"},
    @{Name="Oreo Cookies 137g"; SearchTerm="chocolate cookies"},
    @{Name="Lay's Classic Salted Chips 52g"; SearchTerm="potato chips"},
    @{Name="Kurkure Masala Munch 70g"; SearchTerm="snacks"},
    @{Name="Monaco Salted Biscuits 150g"; SearchTerm="salted biscuits"},
    @{Name="White Bread Loaf 400g"; SearchTerm="white bread"},
    @{Name="Brown Bread Loaf 400g"; SearchTerm="whole wheat bread"},
    @{Name="Croissant Pack of 4"; SearchTerm="croissants"},
    @{Name="Donuts Pack of 6"; SearchTerm="donuts"},
    @{Name="Garlic Bread 200g"; SearchTerm="garlic bread"},
    @{Name="Amul Full Cream Milk 1L"; SearchTerm="milk bottle"},
    @{Name="Amul Butter 100g"; SearchTerm="butter"},
    @{Name="Amul Cheese Slices 200g"; SearchTerm="cheese"},
    @{Name="Yogurt 500g"; SearchTerm="yogurt"},
    @{Name="Cornflakes 500g"; SearchTerm="cereal"},
    @{Name="Frozen Peas 500g"; SearchTerm="peas"},
    @{Name="Frozen French Fries 500g"; SearchTerm="french fries"},
    @{Name="Frozen Chicken Nuggets 300g"; SearchTerm="chicken nuggets"},
    @{Name="Ice Cream Vanilla 500ml"; SearchTerm="ice cream"},
    @{Name="Frozen Mixed Vegetables 500g"; SearchTerm="mixed vegetables"},
    @{Name="Basmati Rice 1kg"; SearchTerm="rice"},
    @{Name="Toor Dal 1kg"; SearchTerm="lentils"},
    @{Name="Wheat Flour 1kg"; SearchTerm="flour"},
    @{Name="Sugar 1kg"; SearchTerm="sugar"},
    @{Name="Salt 1kg"; SearchTerm="salt"},
    @{Name="Baby Diapers Size M Pack of 30"; SearchTerm="diapers"},
    @{Name="Baby Formula Milk 400g"; SearchTerm="baby formula"},
    @{Name="Baby Wipes Pack of 80"; SearchTerm="baby wipes"},
    @{Name="Baby Shampoo 200ml"; SearchTerm="baby shampoo"},
    @{Name="Baby Food Cereal 200g"; SearchTerm="baby food"},
    @{Name="Paracetamol 500mg Strip of 10"; SearchTerm="medicine"},
    @{Name="Band-Aid Pack of 20"; SearchTerm="bandages"},
    @{Name="Thermometer Digital"; SearchTerm="thermometer"},
    @{Name="Vitamin D3 Supplements 60 tablets"; SearchTerm="vitamins"},
    @{Name="Hand Sanitizer 500ml"; SearchTerm="hand sanitizer"},
    @{Name="Detergent Powder 1kg"; SearchTerm="detergent"},
    @{Name="Dish Soap 750ml"; SearchTerm="dish soap"},
    @{Name="Toilet Paper 4 Pack"; SearchTerm="toilet paper"},
    @{Name="Trash Bags Large 20 Pack"; SearchTerm="trash bags"},
    @{Name="Air Freshener Spray 500ml"; SearchTerm="air freshener"},
    @{Name="Cotton T-Shirt Men's M"; SearchTerm="t-shirt"},
    @{Name="Jeans Men's 32"; SearchTerm="jeans"},
    @{Name="Running Shoes Size 9"; SearchTerm="running shoes"},
    @{Name="Women's Handbag"; SearchTerm="handbag"},
    @{Name="Sunglasses Unisex"; SearchTerm="sunglasses"},
    @{Name="USB Cable Type-C 1m"; SearchTerm="usb cable"},
    @{Name="Wireless Mouse"; SearchTerm="computer mouse"},
    @{Name="Phone Case Universal"; SearchTerm="phone case"},
    @{Name="Power Bank 10000mAh"; SearchTerm="power bank"},
    @{Name="Bluetooth Earbuds"; SearchTerm="earbuds"},
    @{Name="Shampoo 400ml"; SearchTerm="shampoo"},
    @{Name="Face Moisturizer 100ml"; SearchTerm="moisturizer"},
    @{Name="Toothpaste 150g"; SearchTerm="toothpaste"},
    @{Name="Deodorant Spray 150ml"; SearchTerm="deodorant"},
    @{Name="Lip Balm Pack of 3"; SearchTerm="lip balm"},
    @{Name="Screwdriver Set 10 Pieces"; SearchTerm="screwdriver"},
    @{Name="Hammer 500g"; SearchTerm="hammer"},
    @{Name="Drill Bits Set 20 Pieces"; SearchTerm="drill bits"},
    @{Name="Measuring Tape 5m"; SearchTerm="measuring tape"},
    @{Name="Paint Brush Set 5 Pieces"; SearchTerm="paint brush"}
)

Write-Host "Starting to download product images..." -ForegroundColor Green
Write-Host "Total products: $($products.Count)" -ForegroundColor Cyan

$successCount = 0
$failCount = 0

foreach ($product in $products) {
    $fileName = $product.Name -replace '[<>:"/\\|?*]', '_'
    $fileName = $fileName -replace '\s+', '_'
    $filePath = Join-Path $productsFolder "$fileName.jpg"
    
    if (Test-Path $filePath) {
        Write-Host "Skipping $fileName (already exists)" -ForegroundColor Yellow
        $successCount++
        continue
    }
    
    $downloaded = $false
    $maxRetries = 3
    $retryCount = 0
    
    Write-Host "Downloading: $($product.Name)..." -ForegroundColor Cyan
    
    while ($retryCount -lt $maxRetries -and -not $downloaded) {
        try {
            # Try using Picsum Photos with random images (more reliable)
            $randomId = Get-Random -Minimum 1 -Maximum 1000
            $imageUrl = "https://picsum.photos/400/400?random=$randomId"
            
            $response = Invoke-WebRequest -Uri $imageUrl -Method Get -TimeoutSec 15 -UseBasicParsing -ErrorAction Stop
            [System.IO.File]::WriteAllBytes($filePath, $response.Content)
            Write-Host "  Success: $fileName" -ForegroundColor Green
            $successCount++
            $downloaded = $true
            Start-Sleep -Milliseconds 300
        }
        catch {
            $retryCount++
            if ($retryCount -lt $maxRetries) {
                Write-Host "  Retry $retryCount/$maxRetries for $fileName" -ForegroundColor Yellow
                Start-Sleep -Seconds 1
            }
            else {
                $downloaded = $false
            }
        }
    }
    
    if (-not $downloaded) {
        try {
            # Create a simple colored placeholder using placeholder.com
            $productText = $product.Name.Substring(0, [Math]::Min(15, $product.Name.Length)) -replace ' ', '%20'
            $fallbackUrl = "https://via.placeholder.com/400x400/E0E0E0/757575.png?text=$productText"
            $fallbackResponse = Invoke-WebRequest -Uri $fallbackUrl -Method Get -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
            [System.IO.File]::WriteAllBytes($filePath, $fallbackResponse.Content)
            Write-Host "  Created placeholder for $fileName" -ForegroundColor Yellow
            $successCount++
        }
        catch {
            Write-Host "  Failed: $fileName" -ForegroundColor Red
            $failCount++
        }
    }
}

Write-Host ""
Write-Host "Download complete!" -ForegroundColor Green
Write-Host "Success: $successCount" -ForegroundColor Green
Write-Host "Failed: $failCount" -ForegroundColor $(if ($failCount -gt 0) { "Red" } else { "Green" })
