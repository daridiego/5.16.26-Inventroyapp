import { useState, useEffect, useCallback, useRef } from "react";
import * as XLSX from "xlsx";
import { loadInventoryData, saveInventoryData } from "./storage";
 
const SOURCE_ITEMS = [{"id":1,"storeOrder":1.0,"storeLocationNum":1030,"name":"Mexican Code 1/2L","location":"Corner Far","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":2,"storeOrder":1.0,"storeLocationNum":800,"name":"Sauce To-Go Container 4 Oz","location":"Corner Far","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":3,"storeOrder":1.0,"storeLocationNum":410,"name":"Queso Liquido","location":"Corner Far","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":4,"storeOrder":1.0,"storeLocationNum":1010,"name":"Canned Coke","location":"Corner Far","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":5,"storeOrder":1.0,"storeLocationNum":1000,"name":"Apple Juice","location":"Corner Far","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":6,"storeOrder":1.0,"storeLocationNum":1000,"name":"Mango Juice","location":"Corner Far","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":7,"storeOrder":1.0,"storeLocationNum":1000,"name":"Orange Juice","location":"Corner Far","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":8,"storeOrder":1.0,"storeLocationNum":990,"name":"Bottled Water","location":"Corner Far","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":9,"storeOrder":1.0,"storeLocationNum":990,"name":"Topo chico","location":"Corner Far","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":10,"storeOrder":1.0,"storeLocationNum":400,"name":"Chipotel En Adobo","location":"Corner Far","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":11,"storeOrder":1.0,"storeLocationNum":690,"name":"9\" Aluminum Round Containers","location":"Corner Far","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":12,"storeOrder":1.0,"storeLocationNum":700,"name":"7\" Aluminum Round Containers","location":"Corner Far","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":13,"storeOrder":1.0,"storeLocationNum":1150,"name":"Nopales","location":"Corner Far","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":14,"storeOrder":1.0,"storeLocationNum":670,"name":"To Go Soup Containers 24Oz","location":"Corner Far","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":15,"storeOrder":1.2,"storeLocationNum":780,"name":"Straws wrapped 10\"","location":"Corner","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":16,"storeOrder":1.2,"storeLocationNum":790,"name":"Lid for Sauce To-Go Container 4 Oz","location":"Corner","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":17,"storeOrder":1.2,"storeLocationNum":880,"name":"Sternos","location":"Corner","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":18,"storeOrder":1.2,"storeLocationNum":930,"name":"Serving Spoons Disposable","location":"Corner","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":19,"storeOrder":1.2,"storeLocationNum":940,"name":"Seving Forks Disposable","location":"Corner","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":20,"storeOrder":1.2,"storeLocationNum":950,"name":"Serving Tongs Disposable","location":"Corner","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":21,"storeOrder":1.2,"storeLocationNum":1230,"name":"Wire Chaffing Dishes","location":"Corner","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":22,"storeOrder":1.2,"storeLocationNum":1000,"name":"Diet Coke (can)","location":"Corner","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":23,"storeOrder":1.2,"storeLocationNum":1020,"name":"Canned Sprite","location":"Corner","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":24,"storeOrder":1.2,"storeLocationNum":680,"name":"Lids for 7\" Aluminum Round Containers","location":"Corner","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":25,"storeOrder":1.2,"storeLocationNum":670,"name":"Lids for 9\" Aluminum Round Containers","location":"Corner","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":26,"storeOrder":1.2,"storeLocationNum":850,"name":"Plastic Forks Heavy Weight","location":"Corner","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":27,"storeOrder":1.2,"storeLocationNum":450,"name":"Togo contenedores para flan","location":"Corner","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":28,"storeOrder":1.2,"storeLocationNum":380,"name":"Ketchup Bottles","location":"Corner","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":29,"storeOrder":1.2,"storeLocationNum":740,"name":"Burrito Paper (food Wrap) shts 12\"x12\"","location":"Corner","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":30,"storeOrder":1.2,"storeLocationNum":740,"name":"Burrito Paper (food Wrap) shts 9\"x12\"","location":"Corner","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":31,"storeOrder":1.2,"storeLocationNum":660,"name":"To Go Soup Containers 16 Oz","location":"Corner","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":32,"storeOrder":1.2,"storeLocationNum":650,"name":"To Go Cups 16 Oz for fountain TP16D","location":"Corner","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":33,"storeOrder":1.2,"storeLocationNum":650,"name":"Cups para horchata grande","location":"Corner","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":34,"storeOrder":1.2,"storeLocationNum":650,"name":"Lids para horchata grande","location":"Corner","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":35,"storeOrder":1.2,"storeLocationNum":650,"name":"Lids For Fountain Cups","location":"Corner","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":36,"storeOrder":1.5,"storeLocationNum":240,"name":"Glitter Cleaner para plancha","location":"Corner Under Fountain","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":37,"storeOrder":1.5,"storeLocationNum":1060,"name":"Lime Juice","location":"Corner Under Fountain","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":38,"storeOrder":2.0,"storeLocationNum":810,"name":"Lid for Sauce To-Go Container .75 Oz","location":"Cabinets","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":39,"storeOrder":2.0,"storeLocationNum":820,"name":"Sauce To-Go Container .75 Oz","location":"Cabinets","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":40,"storeOrder":2.0,"storeLocationNum":1070,"name":"Napkins","location":"Cabinets","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":41,"storeOrder":2.0,"storeLocationNum":450,"name":"Papel Para Impresora de enfrete","location":"Cabinets","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":42,"storeOrder":2.0,"storeLocationNum":450,"name":"Papel para impresora de cocina","location":"Cabinets","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":43,"storeOrder":2.0,"storeLocationNum":1160,"name":"Masking Tape","location":"Cabinets","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":44,"storeOrder":2.0,"storeLocationNum":460,"name":"Ketchup Packets","location":"Cabinets","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":45,"storeOrder":2.0,"storeLocationNum":490,"name":"Sugar (For Flan)","location":"Cabinets","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":46,"storeOrder":2.5,"storeLocationNum":960,"name":"4# Paper Bags","location":"Coke Shelve","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":47,"storeOrder":2.5,"storeLocationNum":970,"name":"6# Geocery Brown Paper Bags","location":"Coke Shelve","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":48,"storeOrder":2.6,"storeLocationNum":450,"name":"Cooking Oil","location":"Next to chip warmer","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":49,"storeOrder":2.6,"storeLocationNum":520,"name":"Salt","location":"Next to chip warmer","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":50,"storeOrder":2.7,"storeLocationNum":890,"name":"Aluminum Full Pans Deep","location":"Top Shelves","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":51,"storeOrder":2.7,"storeLocationNum":900,"name":"Aluminum Full Pans Medium","location":"Top Shelves","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":52,"storeOrder":2.7,"storeLocationNum":900,"name":"Aluminum Full Pans Shallow","location":"Top Shelves","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":53,"storeOrder":2.7,"storeLocationNum":900,"name":"Aluminum Half Pans Medium","location":"Top Shelves","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":54,"storeOrder":2.7,"storeLocationNum":900,"name":"Aluminum Half Pans Deep","location":"Top Shelves","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":55,"storeOrder":2.7,"storeLocationNum":910,"name":"Aluminum Full Pan Lids","location":"Top Shelves","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":56,"storeOrder":2.7,"storeLocationNum":920,"name":"Aluminum Half Pan Lids","location":"Top Shelves","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":57,"storeOrder":3.0,"storeLocationNum":980,"name":"20# Paper Bags Shorties","location":"Mueble 2","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":58,"storeOrder":3.0,"storeLocationNum":630,"name":"Bolsas Para Churros","location":"Mueble 2","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":59,"storeOrder":3.0,"storeLocationNum":450,"name":"Tinta para impresora de cocina","location":"Mueble 2","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":60,"storeOrder":3.0,"storeLocationNum":630,"name":"Cup carrier","location":"Mueble 2","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":61,"storeOrder":3.0,"storeLocationNum":450,"name":"Marg Mix","location":"Mueble 2","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":62,"storeOrder":3.0,"storeLocationNum":450,"name":"Tripple Sec","location":"Mueble 2","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":63,"storeOrder":3.0,"storeLocationNum":1170,"name":"Chamoy","location":"Mueble 2","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":64,"storeOrder":3.0,"storeLocationNum":720,"name":"Aluminium individual Wrap para burrito","location":"Mueble 2","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":65,"storeOrder":3.0,"storeLocationNum":730,"name":"Aluminum Large (18\"x500ft)","location":"Mueble 2","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":66,"storeOrder":3.0,"storeLocationNum":750,"name":"Plastic Wrap Large (18\"x2000ft)","location":"Mueble 2","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":67,"storeOrder":3.0,"storeLocationNum":760,"name":"Plastic Wrap Meduim (12in x 3000\")","location":"Mueble 2","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":68,"storeOrder":3.0,"storeLocationNum":450,"name":"Mango Flavor For Margs","location":"Bar","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":69,"storeOrder":3.0,"storeLocationNum":450,"name":"Strawberry Flavor For Margs","location":"Bar","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":70,"storeOrder":3.3,"storeLocationNum":2000,"name":"Sharpies","location":"Cashier area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":71,"storeOrder":3.4,"storeLocationNum":330,"name":"Tajin","location":"Cajon","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":72,"storeOrder":3.4,"storeLocationNum":860,"name":"Plastic Knives Heavy Weight","location":"Cajon","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":73,"storeOrder":3.4,"storeLocationNum":870,"name":"Plastic Spoons Heavy Weight","location":"Cajon","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":74,"storeOrder":3.4,"storeLocationNum":710,"name":"Tooth Picks","location":"Cajon","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":75,"storeOrder":3.5,"storeLocationNum":430,"name":"Crushed Tomatillo","location":"Can area","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":76,"storeOrder":3.5,"storeLocationNum":410,"name":"Sliced Jalapeños","location":"Can area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":77,"storeOrder":3.5,"storeLocationNum":420,"name":"Sliced Olives","location":"Can area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":78,"storeOrder":3.5,"storeLocationNum":1140,"name":"Salsa Mexicana Embassa","location":"Can area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":79,"storeOrder":3.5,"storeLocationNum":1250,"name":"White towles","location":"Can area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":80,"storeOrder":3.5,"storeLocationNum":470,"name":"Condensed Milk (For Flan)","location":"Can area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":81,"storeOrder":3.5,"storeLocationNum":480,"name":"Evaporated Milk (For Flan)","location":"Can area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":82,"storeOrder":3.5,"storeLocationNum":420,"name":"Chicken Stock (Caldo De pollo)","location":"Bar","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":83,"storeOrder":3.55,"storeLocationNum":450,"name":"Tequila","location":"Bar","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":84,"storeOrder":3.55,"storeLocationNum":830,"name":"Latex Disposable Gloves-L","location":"Bar","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":85,"storeOrder":3.55,"storeLocationNum":840,"name":"Latex Disposable Gloves-M","location":"Bar","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":86,"storeOrder":3.55,"storeLocationNum":1240,"name":"To Go bags Big","location":"Bar","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":87,"storeOrder":3.7,"storeLocationNum":240,"name":"Sanitizing tablets","location":"Mueble 2","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":88,"storeOrder":3.7,"storeLocationNum":250,"name":"Glass Cleaner","location":"Bar","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":89,"storeOrder":3.7,"storeLocationNum":260,"name":"Hand Soap","location":"Bar","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":90,"storeOrder":4.0,"storeLocationNum":1130,"name":"Light Chilli Powder (New Mexico)","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":91,"storeOrder":4.0,"storeLocationNum":440,"name":"Fryer Oil Filters","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":92,"storeOrder":4.0,"storeLocationNum":280,"name":"Bleach","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":93,"storeOrder":4.0,"storeLocationNum":290,"name":"Pinesol","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":94,"storeOrder":4.0,"storeLocationNum":300,"name":"Green Scotch Brite","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":95,"storeOrder":4.0,"storeLocationNum":310,"name":"Steel Wool (esponja de metal)","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":96,"storeOrder":4.0,"storeLocationNum":320,"name":"Grill Brick","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":97,"storeOrder":4.0,"storeLocationNum":340,"name":"Tomato Bouillon With Chicken (Knorr)","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":98,"storeOrder":4.0,"storeLocationNum":350,"name":"Salsa Inglesa","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":99,"storeOrder":4.0,"storeLocationNum":360,"name":"Apple Cider Vinegar","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":100,"storeOrder":4.0,"storeLocationNum":390,"name":"Vanilla (For Flan)","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":101,"storeOrder":4.0,"storeLocationNum":530,"name":"Granulated Garlic","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":102,"storeOrder":4.0,"storeLocationNum":540,"name":"Groud Cumin","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":103,"storeOrder":4.0,"storeLocationNum":550,"name":"Ground Black Pepper","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":104,"storeOrder":4.0,"storeLocationNum":540,"name":"Marjoarn","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":105,"storeOrder":4.0,"storeLocationNum":540,"name":"Thyme","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":106,"storeOrder":4.0,"storeLocationNum":560,"name":"Beef Base","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"No","vendor":"Restaurant Depot","unit":"each","category":""},{"id":107,"storeOrder":4.0,"storeLocationNum":560,"name":"Ground Cinnamon","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":108,"storeOrder":4.0,"storeLocationNum":560,"name":"Red Chilli Flakes","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":109,"storeOrder":4.0,"storeLocationNum":580,"name":"Whole Mexican Oregano","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":110,"storeOrder":4.0,"storeLocationNum":590,"name":"Whole Pepper","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":111,"storeOrder":4.0,"storeLocationNum":600,"name":"Ground Cloves","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":112,"storeOrder":4.0,"storeLocationNum":610,"name":"Whole Cloves","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":113,"storeOrder":4.0,"storeLocationNum":770,"name":"Sandwich Bags for Portioning","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":114,"storeOrder":4.0,"storeLocationNum":1090,"name":"Taco Seasoning (McCormic)","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":115,"storeOrder":4.0,"storeLocationNum":1180,"name":"Achiote","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":116,"storeOrder":4.0,"storeLocationNum":1190,"name":"Guajillo","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":117,"storeOrder":4.0,"storeLocationNum":1200,"name":"New Mexico","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":118,"storeOrder":4.0,"storeLocationNum":1210,"name":"Pasilla","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":119,"storeOrder":4.0,"storeLocationNum":1220,"name":"Chile de Arbol","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":120,"storeOrder":4.0,"storeLocationNum":1290,"name":"Mole Paste","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":121,"storeOrder":4.0,"storeLocationNum":450,"name":"Crisco (all vegy shortening)","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":122,"storeOrder":4.0,"storeLocationNum":1040,"name":"Horchata Mix","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":123,"storeOrder":4.0,"storeLocationNum":500,"name":"Harina de tamales","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":124,"storeOrder":4.0,"storeLocationNum":570,"name":"Ground Paprika","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":125,"storeOrder":5.0,"storeLocationNum":160,"name":"Chicken Strips","location":"Freezer","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":126,"storeOrder":5.0,"storeLocationNum":150,"name":"Fries","location":"Freezer","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":127,"storeOrder":5.0,"storeLocationNum":210,"name":"Churros","location":"Freezer","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":128,"storeOrder":5.0,"storeLocationNum":2000,"name":"Pulpa de Aguacate","location":"Freezer","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":129,"storeOrder":5.0,"storeLocationNum":2000,"name":"Carne para menudo","location":"Freezer","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":130,"storeOrder":5.0,"storeLocationNum":80,"name":"Chorizo","location":"Freezer","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":131,"storeOrder":5.0,"storeLocationNum":210,"name":"Bacon 14/16 (tiras)","location":"Freezer","par":0,"reorder":0,"notes":"","frequency":2,"active":"No","vendor":"Restaurant Depot","unit":"each","category":""},{"id":132,"storeOrder":5.0,"storeLocationNum":230,"name":"Mahi Mahi Taco pieces","location":"Freezer","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":133,"storeOrder":5.0,"storeLocationNum":1110,"name":"Bread for Tortas","location":"Freezer","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":134,"storeOrder":6.0,"storeLocationNum":510,"name":"Hoja para tamal","location":"Line Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":135,"storeOrder":6.0,"storeLocationNum":30,"name":"Potatoes","location":"Line Area","par":0,"reorder":0,"notes":"","frequency":2,"active":"No","vendor":"Restaurant Depot","unit":"each","category":""},{"id":136,"storeOrder":6.0,"storeLocationNum":40,"name":"Yellow Onions","location":"Line Area","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":137,"storeOrder":6.0,"storeLocationNum":460,"name":"Frijoles","location":"Line Area","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":138,"storeOrder":6.0,"storeLocationNum":460,"name":"Parbroiled Rice","location":"Line Area","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":139,"storeOrder":6.0,"storeLocationNum":20,"name":"Avocado","location":"Line Area","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":140,"storeOrder":6.0,"storeLocationNum":620,"name":"To Go Boxes #1","location":"Line Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":141,"storeOrder":6.0,"storeLocationNum":630,"name":"To Go Boxes #3","location":"Line Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":142,"storeOrder":6.0,"storeLocationNum":640,"name":"To Go Boxes #8","location":"Line Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":143,"storeOrder":7.0,"storeLocationNum":10,"name":"Roma Tomatoes","location":"Walk In","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":144,"storeOrder":7.0,"storeLocationNum":50,"name":"Pineapple","location":"Walk In","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":145,"storeOrder":7.0,"storeLocationNum":90,"name":"Cilantro","location":"Walk In","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":146,"storeOrder":7.0,"storeLocationNum":110,"name":"Green Onion","location":"Walk In","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":147,"storeOrder":7.0,"storeLocationNum":120,"name":"Red Bell Peppers","location":"Walk In","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":148,"storeOrder":7.0,"storeLocationNum":120,"name":"Green Bell Peppers","location":"Walk In","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":149,"storeOrder":7.0,"storeLocationNum":120,"name":"Zuchinni Green","location":"Walk In","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":150,"storeOrder":7.0,"storeLocationNum":120,"name":"Squash Yellow","location":"Walk In","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":151,"storeOrder":7.0,"storeLocationNum":220,"name":"Huevo Liquido","location":"Walk In","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":152,"storeOrder":7.0,"storeLocationNum":130,"name":"Serranos","location":"Walk In","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":153,"storeOrder":7.0,"storeLocationNum":140,"name":"Iceberg Lettuce","location":"Walk In","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":154,"storeOrder":7.0,"storeLocationNum":170,"name":"Fancy Shred Jack Cheese Jack Chedar","location":"Walk In","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":155,"storeOrder":7.0,"storeLocationNum":170,"name":"Mozarela cheese","location":"Walk In","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":156,"storeOrder":7.0,"storeLocationNum":190,"name":"Boneless Skinless Chicken Thighs","location":"Walk In","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":157,"storeOrder":7.0,"storeLocationNum":200,"name":"Sour Cream Mexican Style","location":"Walk In","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":158,"storeOrder":7.0,"storeLocationNum":220,"name":"Large Eggs","location":"Walk In","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":159,"storeOrder":7.0,"storeLocationNum":70,"name":"Pealed Garlic","location":"Walk In","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":160,"storeOrder":7.0,"storeLocationNum":100,"name":"Jalapeños Fresh","location":"Walk In","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":161,"storeOrder":7.0,"storeLocationNum":60,"name":"Limes","location":"Walk In","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":162,"storeOrder":7.0,"storeLocationNum":180,"name":"Grated Queso Cotija","location":"Walk In","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":163,"storeOrder":7.0,"storeLocationNum":1100,"name":"Leche Para En Caja de Carton","location":"Walk In","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":164,"storeOrder":7.0,"storeLocationNum":370,"name":"Mayonnaise","location":"Walk In","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":165,"storeOrder":8.0,"storeLocationNum":1260,"name":"Bags for Rice","location":"Bathroom","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":166,"storeOrder":8.0,"storeLocationNum":1270,"name":"White Garbage Bags 13 Gallons","location":"Bathroom","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":167,"storeOrder":8.0,"storeLocationNum":1280,"name":"Black Garbage bags","location":"Bathroom","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":168,"storeOrder":8.0,"storeLocationNum":270,"name":"Dawn Soap","location":"Bathroom","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":169,"storeOrder":8.0,"storeLocationNum":1050,"name":"Toilet Paper","location":"Bathroom","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":170,"storeOrder":8.0,"storeLocationNum":1080,"name":"Paper Towels (GR-340)","location":"Bathroom","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""}];
const LOCATIONS = [
  "Bar",
  "Bathroom",
  "Cabinets",
  "Can area",
  "Cajon",
  "Cashier area",
  "Coke Shelve",
  "Corner",
  "Corner Far",
  "Corner Under Fountain",
  "Dish Washer Area",
  "Freezer",
  "Line Area",
  "Mueble 2",
  "Next to chip warmer",
  "Top Shelves",
  "Walk In",
  "Other",
]; 
const UNITS = ["each","case","lbs","bags","boxes","gallons","oz","flats","bunches","cans"];

const CATEGORIES = ["","Beverages","Cleaning","Dairy","Dry Goods","Frozen","Paper Goods","Produce","Proteins","Supplies","Other"];
const STORAGE_KEY = "resto-inv-v3";
const uid = () => Date.now().toString(36)+Math.random().toString(36).slice(2);
 
const needToOrder = (item, count) => {
  const n = parseFloat(count);
  if (isNaN(n)||count===""||count===undefined) return 0;
  return Math.max(0,(item.par||0)-n);
};
const statusOf = (count,par,reorder) => {
  if (count===""||count===null||count===undefined) return "neutral";
  const n=parseFloat(count);
  if(n<=(reorder||0)) return "critical";
  if(n<(par||0)*0.6) return "low";
  return "good";
};
const SC={critical:"#ef4444",low:"#f59e0b",good:"#22c55e",neutral:"#d1d5db"};
 

function exportToExcel(items,counts){
  const rows=[...items].sort((a,b)=>a.storeOrder-b.storeOrder).map(item=>({
    "Location #":item.storeOrder,"Store SKU":item.storeLocationNum,"Item Name":item.name,
    "In-House Location":item.location,"Category":item.category,"Unit":item.unit,
    "To Have (Par)":item.par||"","Reorder Point":item.reorder||"",
    "On Hand (Last Count)":counts[item.id]!==undefined?counts[item.id]:"",
    "Need To Order":counts[item.id]!==undefined?(needToOrder(item,counts[item.id])||""):"",
    "Frequency":item.frequency,"Active":item.active,"Vendor":item.vendor,"Notes":item.notes,
  }));
  const ws=XLSX.utils.json_to_sheet(rows);
  ws["!cols"]=[8,10,32,20,14,8,10,10,14,12,8,6,16,20].map(w=>({wch:w}));
  const wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,ws,"Inventory");
  XLSX.writeFile(wb,`inventory-${new Date().toISOString().slice(0,10)}.xlsx`);
}
 
function generatePO(orderItems, date){
  const grouped = orderItems.reduce((acc, item) => {
    const key = item.location || "Other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const sections = Object.entries(grouped).map(([location, items]) => `
    <h2>${escapeHtml(location)}</h2>
    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th>Qty to Order</th>
          <th>Unit</th>
          <th>On Hand</th>
          <th>Par</th>
          <th>Vendor</th>
        </tr>
      </thead>
      <tbody>
        ${items.map(item => {
          const isCritical = parseFloat(item.count || 0) <= (item.reorder || 0);
          return `
            <tr class="${isCritical ? "critical" : ""}">
              <td>${escapeHtml(item.name)}</td>
              <td>${escapeHtml(item.toOrder)}</td>
              <td>${escapeHtml(item.unit)}</td>
              <td>${escapeHtml(item.count || 0)}</td>
              <td>${escapeHtml(item.par || 0)}</td>
              <td>${escapeHtml(item.vendor || "")}</td>
            </tr>
          `;
        }).join("")}
      </tbody>
    </table>
  `).join("");

  return `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Purchase Order - ${escapeHtml(date)}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 32px; color: #111827; }
    h1 { margin: 0 0 4px; }
    .date { color: #6b7280; margin-bottom: 24px; }
    h2 { margin-top: 28px; padding-top: 12px; border-top: 2px solid #e5e7eb; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
    th { background: #f3f4f6; }
    tr.critical td { background: #fee2e2; }
    footer { margin-top: 36px; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <h1>PURCHASE ORDER</h1>
  <div class="date">${escapeHtml(date)}</div>
  ${sections || "<p>No items need to be ordered.</p>"}
  <footer>Restaurant Inventory System</footer>
</body>
</html>`;
}

function escapeHtml(value){
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function EditCell({value,onSave,type="text",options=null,width=100}){
  const [v,setV]=useState(String(value??""));
  const ref=useRef();
  useEffect(()=>{try{ref.current?.focus();ref.current?.select();}catch(e){}},[]);
  const commit=()=>{try{onSave(type==="number"?(parseFloat(v)||0):v);}catch(e){}};
  if(options){
    const allOptions = options.includes(v) ? options : [v, ...options];
    return(
      <select ref={ref} value={v} style={{...s.inlineInput,width}}
        onChange={e=>{setV(e.target.value);onSave(e.target.value);}}
        onBlur={commit}>
        {allOptions.map(o=><option key={o} value={o}>{o||"—"}</option>)}
      </select>
    );
  }
  return(<input ref={ref} value={v} type={type==="number"?"number":"text"} style={{...s.inlineInput,width}} onChange={e=>setV(e.target.value)} onBlur={commit} onKeyDown={e=>{if(e.key==="Enter")commit();if(e.key==="Escape")onSave(null);}}/>);
}

 
export default function App(){
  const [items,setItems]=useState(SOURCE_ITEMS);
  const [counts,setCounts]=useState({});
  const [view,setView]=useState("count");
  const [search,setSearch]=useState("");
  const [filterLoc,setFilterLoc]=useState("All");
  const [filterActive,setFilterActive]=useState("Active");
  const [countedOnly,setCountedOnly]=useState(false);
  const [editingCell,setEditingCell]=useState(null);
  const [poHTML,setPoHTML]=useState(null);
  const [generating,setGenerating]=useState(false);
  const [saved,setSaved]=useState(false);
  const date=new Date().toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"});
 
useEffect(() => {
  loadInventoryData().then((d) => {
    if (d?.counts) setCounts(d.counts);
    if (d?.items && d.items.length > 0) {
      // Build a map of saved items by id so we can merge editable fields back
      const savedById = Object.fromEntries(d.items.map(i => [i.id, i]));
      // Start from SOURCE_ITEMS so hardcoded items always appear,
      // then overlay any saved edits (par, reorder, notes, location, etc.)
      const merged = SOURCE_ITEMS.map(item => {
        const saved = savedById[item.id];
        if (!saved) return item;
        // Merge only editable fields — not name/id which come from source
        return {
          ...item,
          par: saved.par ?? item.par,
          reorder: saved.reorder ?? item.reorder,
          notes: saved.notes ?? item.notes,
          location: saved.location ?? item.location,
          category: saved.category ?? item.category,
          unit: saved.unit ?? item.unit,
          active: saved.active ?? item.active,
          vendor: saved.vendor ?? item.vendor,
          storeOrder: saved.storeOrder ?? item.storeOrder,
          storeLocationNum: saved.storeLocationNum ?? item.storeLocationNum,
          frequency: saved.frequency ?? item.frequency,
        };
      });
      // Also keep any items that were added via the app (not in SOURCE_ITEMS)
      const sourceIds = new Set(SOURCE_ITEMS.map(i => i.id));
      const addedItems = d.items.filter(i => !sourceIds.has(i.id));
      setItems([...merged, ...addedItems]);
    }
  });
}, []);


 
  const persist=useCallback((ni,nc)=>{setItems(ni);setCounts(nc);saveInventoryData({ items: ni, counts: nc });setSaved(true);setTimeout(()=>setSaved(false),1500);},[]);
 
  const updateField=(id,field,value)=>{if(value===null){setEditingCell(null);return;}persist(items.map(i=>i.id===id?{...i,[field]:value}:i),counts);setEditingCell(null);};
  const updateCount=(id,val)=>persist(items,{...counts,[id]:val});
  const deleteItem=(id)=>{if(!confirm("Delete this item?"))return;persist(items.filter(i=>i.id!==id),counts);};
  const addItem=()=>{const item={id:uid(),storeOrder:items.length+1,storeLocationNum:0,name:"New Item",location:LOCATIONS[0]||"Other",category:"",unit:"each",par:0,reorder:0,notes:"",frequency:1,active:"Yes",vendor:"Restaurant Depot"};persist([...items,item],counts);};
 
  const sorted=[...items].sort((a,b)=>a.storeOrder-b.storeOrder);
  // WITH THIS:
const filtered=sorted.filter(item=>{
    if(search&&!item.name.toLowerCase().includes(search.toLowerCase()))return false;
    if(filterLoc!=="All"&&item.location!==filterLoc)return false;
    if(countedOnly&&(counts[item.id]===undefined||counts[item.id]===""))return false;
    return true;
  });

const filteredManage=[
    ...filtered.filter(i=>i.active==="Yes"),
    ...filtered.filter(i=>i.active!=="Yes"),
  ];
 
  const countedCount=Object.values(counts).filter(v=>v!=="").length;
  const orderItems=sorted.filter(i=>i.active==="Yes").map(i=>({...i,count:counts[i.id]??"",toOrder:needToOrder(i,counts[i.id]??"")})).filter(i=>i.toOrder>0);
  const isEditing=(id,field)=>editingCell?.itemId===id&&editingCell?.field===field;
 
  function handlePO(){setGenerating(true);setPoHTML(null);try{const h=generatePO(orderItems,date);setPoHTML(h);setView("order");}catch{alert("Failed, try again.");}setGenerating(false);}
  function downloadPO(){const b=new Blob([poHTML],{type:"text/html"});const u=URL.createObjectURL(b);const a=document.createElement("a");a.href=u;a.download=`purchase-order-${new Date().toISOString().slice(0,10)}.html`;a.click();URL.revokeObjectURL(u);}
 
  return(
    <div style={s.app}>
      <div style={s.header}>
        <div style={s.hL}><span style={{fontSize:24}}>🍽️</span><div><div style={s.title}>Rio Bravito Inventory</div><div style={s.sub}>{date}</div></div></div>
        <div style={s.hR}>{saved&&<span style={s.savedBadge}>✓ Saved</span>}<div style={s.prog}><div style={s.progBar}><div style={{...s.progFill,width:`${items.length?(countedCount/items.length)*100:0}%`}}/></div><span style={s.progLbl}>{countedCount}/{items.length}</span></div></div>
      </div>
 
      <div style={s.nav}>
        {[["count","📋 Count"],["manage","⚙️ Manage"],["order",`🛒 Order${orderItems.length?` (${orderItems.length})`:""}`]].map(([v,l])=>(
          <button key={v} style={{...s.navBtn,...(view===v?s.navA:{})}} onClick={()=>setView(v)}>{l}</button>
        ))}
      </div>
 
      {view==="count"&&(
        <div style={s.content}>
          <div style={s.toolbar}>
            <input style={s.search} placeholder="🔍 Search items..." value={search} onChange={e=>setSearch(e.target.value)}/>
            <div style={s.fRow}>
              <select style={s.sel} value={filterLoc} onChange={e=>setFilterLoc(e.target.value)}>
                <option value="All">All Locations</option>{LOCATIONS.map(l=><option key={l} value={l}>{l}</option>)}
              </select>
              <select style={s.sel} value={filterActive} onChange={e=>setFilterActive(e.target.value)}>
                <option value="Active">Active Only</option><option value="All">All</option><option value="Inactive">Inactive</option>
              </select>
              <label style={s.chk}><input type="checkbox" checked={countedOnly} onChange={e=>setCountedOnly(e.target.checked)}/> Counted</label>
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {filtered.map(item=>{
              const val=counts[item.id]??"";
              const st=statusOf(val,item.par,item.reorder);
              return(
                <div key={item.id} style={{...s.card,borderLeft:`4px solid ${SC[st]}`,opacity:item.active==="No"?0.55:1}}>
                  <div style={s.iName}>{item.name}{item.active==="No"&&<span style={s.inactBadge}>INACTIVE</span>}</div>
                  <div style={s.metaRow}>
                    <span style={s.locBadge}>📍 {item.location}</span>
                    {item.category&&<span style={s.catBadge}>{item.category}</span>}
                    <span style={s.mTxt}>Par: <b>{item.par||"—"}</b></span>
                    <span style={s.mTxt}>Reorder: <b>{item.reorder||"—"}</b></span>
                    {item.notes&&<span style={s.noteTxt}>📝 {item.notes}</span>}
                  </div>
                  <div style={s.qtyLbl}>📥 QTY ON HAND:</div>
                  <div style={s.cRow}>
                    <button style={s.nudge} onClick={()=>updateCount(item.id,Math.max(0,(parseFloat(val)||0)-1))}>−</button>
                    <input style={{...s.cIn,background:st==="critical"?"#fff0f0":st==="low"?"#fffbf0":val!==""?"#f0fff4":"#fff",borderColor:val===""?"#f59e0b":SC[st]}} type="number" min="0" placeholder="—" value={val} onChange={e=>updateCount(item.id,e.target.value)}/>
                    <button style={s.nudge} onClick={()=>updateCount(item.id,(parseFloat(val)||0)+1)}>+</button>
                    <span style={s.uLbl}>{item.unit}</span>
                  </div>
                  {val===""&&<div style={s.uncounted}>👆 Tap box above to enter how many you have</div>}
                  {val!==""&&parseFloat(val)<=(item.reorder||0)&&<div style={s.alertB}>⚠️ Below reorder point — need {needToOrder(item,val)} {item.unit}</div>}
                </div>
              );
            })}
            {filtered.length===0&&<div style={s.empty}>No items match your filters.</div>}
          </div>
          <div style={s.fab}>
            <button style={{...s.fabBtn,opacity:generating?0.7:1}} onClick={handlePO} disabled={generating||orderItems.length===0}>
              {generating?"⏳ Generating...":orderItems.length===0?"✅ All Stocked — Nothing to Order":`📄 Generate Purchase Order (${orderItems.length} items)`}
            </button>
          </div>
        </div>
      )}
 
      {view==="manage"&&(
        <div style={s.content}>
          <div style={s.mHeader}>
            <div><div style={{fontWeight:700,fontSize:15}}>Item Management</div><div style={{fontSize:11,color:"#6b7280"}}>{items.length} items · Tap any field to edit</div></div>
            <div style={{display:"flex",gap:7}}>
              <button style={s.xlsBtn} onClick={()=>exportToExcel(items,counts)}>⬇️ Export .xlsx</button>
              <button style={s.addBtn} onClick={addItem}>+ Add</button>
            </div>
          </div>
          <div style={s.toolbar}>
            <input style={s.search} placeholder="🔍 Search..." value={search} onChange={e=>setSearch(e.target.value)}/>
            <div style={s.fRow}>
              <select style={s.sel} value={filterLoc} onChange={e=>setFilterLoc(e.target.value)}>
                <option value="All">All Locations</option>{LOCATIONS.map(l=><option key={l} value={l}>{l}</option>)}
              </select>
              <select style={s.sel} value={filterActive} onChange={e=>setFilterActive(e.target.value)}>
                <option value="Active">Active</option><option value="All">All</option><option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8,paddingBottom:20}}>

           {filteredManage.map((item, idx)=>{
  const prevItem = filteredManage[idx-1];
  const showDivider = idx>0 && item.active!=="Yes" && prevItem?.active==="Yes";
  return(<>
  {showDivider && (
    <div key="divider" style={{textAlign:"center",padding:"10px 0",fontSize:12,fontWeight:700,color:"#9ca3af",letterSpacing:1,borderTop:"2px dashed #e5e7eb",marginTop:4}}>
      ↓ INACTIVE ITEMS ↓
    </div>
  )}
              <div key={item.id} style={{...s.mCard,opacity:item.active==="No"?0.6:1}}>
                <div style={s.mTop}>
                  <div style={s.fg}>
                    <div style={s.fl}>Order #</div>
                    {isEditing(item.id,"storeOrder")?<EditCell value={item.storeOrder} type="number" width={55} onSave={v=>updateField(item.id,"storeOrder",v)}/>:<span style={s.otag} onClick={()=>setEditingCell({itemId:item.id,field:"storeOrder"</>);})}>{item.storeOrder}</span>}
                  </div>
                  <div style={{...s.fg,flex:1}}>
                    <div style={s.fl}>Item Name</div>
                    {isEditing(item.id,"name")?<EditCell value={item.name} width={190} onSave={v=>updateField(item.id,"name",v)}/>:<span style={s.ef} onClick={()=>setEditingCell({itemId:item.id,field:"name"})}>{item.name}</span>}
                  </div>
                  <button style={{...s.actBtn,background:item.active==="Yes"?"#dcfce7":"#fee2e2",color:item.active==="Yes"?"#166534":"#991b1b"}} onClick={()=>updateField(item.id,"active",item.active==="Yes"?"No":"Yes")}>{item.active==="Yes"?"Active":"Inactive"}</button>
                  <button style={s.delBtn} onClick={()=>deleteItem(item.id)}>✕</button>
                </div>
                <div style={s.mFields}>
                  {[["location","Location",LOCATIONS,140],["category","Category",CATEGORIES,120],["unit","Unit",UNITS,80]].map(([field,label,opts,w])=>(
                    <div key={field} style={s.fg}><div style={s.fl}>{label}</div>
                      {isEditing(item.id,field)?<EditCell value={item[field]} options={opts} width={w} onSave={v=>updateField(item.id,field,v)}/>:<span style={s.ef} onClick={()=>setEditingCell({itemId:item.id,field})}>{item[field]||"—"}</span>}
                    </div>
                  ))}
                  {[["par","Par","number",60],["reorder","Reorder","number",60],["vendor","Vendor","text",140],["notes","Notes","text",180]].map(([field,label,type,w])=>(
                    <div key={field} style={s.fg}><div style={s.fl}>{label}</div>
                      {isEditing(item.id,field)?<EditCell value={item[field]} type={type} width={w} onSave={v=>updateField(item.id,field,v)}/>:<span style={s.ef} onClick={()=>setEditingCell({itemId:item.id,field})}>{item[field]||"—"}</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
 
      {view==="order"&&(
        <div style={s.content}>
          {!poHTML?(
            <div style={s.oPrompt}>
              <div style={{fontSize:52,marginBottom:12}}>🛒</div>
              <p style={{color:"#6b7280",fontSize:15,marginBottom:24}}>{orderItems.length===0?"All items are at or above par. Nothing to order!":` ${orderItems.length} items need ordering.`}</p>
              {orderItems.length>0&&<button style={s.fabBtn} onClick={handlePO} disabled={generating}>{generating?"⏳ Generating...":"📄 Generate Purchase Order"}</button>}
            </div>
          ):(
            <div>
              <div style={s.poBar}>
                <span style={{fontWeight:700,color:"#16a34a",fontSize:14}}>✅ Purchase Order Ready</span>
                <div style={{display:"flex",gap:7}}>
                  <button style={s.xlsBtn} onClick={()=>exportToExcel(items,counts)}>⬇️ Export .xlsx</button>
                  <button style={s.addBtn} onClick={downloadPO}>⬇️ Download PO</button>
                </div>
              </div>
              <div style={s.poSum}><b>{orderItems.length} items</b> need to be ordered, sorted by store location order.</div>
              <div style={{display:"flex",flexDirection:"column",gap:8,paddingBottom:20}}>
                {orderItems.map(item=>(
                  <div key={item.id} style={{...s.poRow,background:parseFloat(item.count)<=(item.reorder||0)?"#fff5f5":"#fff"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={s.otag}>{item.storeOrder}</span>
                      <div><div style={{fontWeight:700,fontSize:14}}>{item.name}</div><div style={{fontSize:11,color:"#6b7280"}}>📍 {item.location} · {item.vendor}</div></div>
                    </div>
                    <div style={{textAlign:"right"}}><div style={{fontWeight:700,color:"#1a1a2e",fontSize:14}}>Order: {item.toOrder} {item.unit}</div><div style={{fontSize:11,color:"#9ca3af"}}>Have: {item.count||0} / Par: {item.par}</div></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
 
const s={
  app:{fontFamily:"system-ui,sans-serif",background:"#f7f5f0",minHeight:"100vh",maxWidth:720,margin:"0 auto",paddingBottom:100},
  header:{background:"#1a1a2e",color:"#fff",padding:"12px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:50},
  hL:{display:"flex",alignItems:"center",gap:10},hR:{display:"flex",alignItems:"center",gap:8},
  title:{fontSize:19,fontWeight:700},sub:{fontSize:10,opacity:0.6,marginTop:1},
  savedBadge:{background:"#22c55e",color:"#fff",borderRadius:12,padding:"2px 10px",fontSize:11,fontWeight:700},
  prog:{display:"flex",alignItems:"center",gap:6},progBar:{width:70,height:6,background:"rgba(255,255,255,0.2)",borderRadius:3,overflow:"hidden"},
  progFill:{height:"100%",background:"#22c55e",borderRadius:3,transition:"width 0.3s"},progLbl:{fontSize:12,opacity:0.75},
  nav:{display:"flex",background:"#fff",borderBottom:"1px solid #e5e7eb",position:"sticky",top:53,zIndex:40},
  navBtn:{flex:1,padding:"11px 4px",border:"none",background:"transparent",fontSize:13,fontWeight:500,cursor:"pointer",color:"#6b7280",borderBottom:"3px solid transparent"},
  navA:{color:"#1a1a2e",borderBottom:"3px solid #1a1a2e",fontWeight:700},
  content:{padding:"10px 10px 0"},
  toolbar:{display:"flex",flexDirection:"column",gap:7,marginBottom:10},
  fRow:{display:"flex",gap:7,flexWrap:"wrap",alignItems:"center"},
  search:{width:"100%",padding:"8px 12px",borderRadius:8,border:"1px solid #d1d5db",fontSize:14,boxSizing:"border-box"},
  sel:{padding:"7px 10px",borderRadius:8,border:"1px solid #d1d5db",fontSize:13,background:"#fff"},
  chk:{fontSize:13,display:"flex",alignItems:"center",gap:5,cursor:"pointer"},
  card:{background:"#fff",borderRadius:10,padding:"12px 14px",boxShadow:"0 1px 3px rgba(0,0,0,0.06)",border:"1px solid #e5e7eb"},
  iName:{fontSize:15,fontWeight:700,color:"#111827",marginBottom:5},
  inactBadge:{marginLeft:8,background:"#fee2e2",color:"#991b1b",borderRadius:8,padding:"1px 7px",fontSize:10,fontWeight:700},
  metaRow:{display:"flex",flexWrap:"wrap",gap:5,alignItems:"center",marginBottom:8},
  locBadge:{background:"#e0f2fe",color:"#0369a1",borderRadius:10,padding:"2px 8px",fontSize:11,fontWeight:600,border:"1px solid #bae6fd"},
  catBadge:{background:"#1a1a2e",color:"#fff",borderRadius:10,padding:"2px 8px",fontSize:11,fontWeight:600},
  mTxt:{fontSize:12,color:"#6b7280"},noteTxt:{fontSize:12,color:"#92400e",fontStyle:"italic"},
  qtyLbl:{fontSize:11,fontWeight:700,color:"#374151",textTransform:"uppercase",letterSpacing:0.5,marginBottom:5},
  cRow:{display:"flex",alignItems:"center",gap:8},
  nudge:{width:36,height:36,borderRadius:8,border:"1px solid #d1d5db",background:"#f9fafb",fontSize:18,cursor:"pointer",fontWeight:700,color:"#374151",display:"flex",alignItems:"center",justifyContent:"center"},
  cIn:{width:72,textAlign:"center",padding:"7px 4px",borderRadius:8,border:"2px solid #d1d5db",fontSize:22,fontWeight:700,color:"#111827",transition:"all 0.2s"},
  uLbl:{fontSize:13,color:"#6b7280"},
  uncounted:{marginTop:7,background:"#fffbeb",border:"1px dashed #f59e0b",borderRadius:6,padding:"5px 10px",fontSize:12,color:"#92400e"},
  alertB:{marginTop:7,background:"#fef2f2",border:"1px solid #fecaca",borderRadius:6,padding:"5px 10px",fontSize:12,color:"#b91c1c",fontWeight:500},
  empty:{textAlign:"center",padding:48,color:"#9ca3af",fontSize:14},
  fab:{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:720,background:"linear-gradient(transparent,#f7f5f0 55%)",padding:"18px 14px 14px",boxSizing:"border-box"},
  fabBtn:{width:"100%",padding:14,background:"#1a1a2e",color:"#fff",border:"none",borderRadius:12,fontSize:15,fontWeight:700,cursor:"pointer",letterSpacing:0.3},
  mHeader:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10},
  addBtn:{background:"#1a1a2e",color:"#fff",border:"none",borderRadius:8,padding:"8px 14px",fontSize:13,fontWeight:600,cursor:"pointer"},
  xlsBtn:{background:"#16a34a",color:"#fff",border:"none",borderRadius:8,padding:"8px 14px",fontSize:13,fontWeight:600,cursor:"pointer"},
  mCard:{background:"#fff",borderRadius:10,padding:"10px 12px",border:"1px solid #e5e7eb",boxShadow:"0 1px 2px rgba(0,0,0,0.04)"},
  mTop:{display:"flex",alignItems:"center",gap:8,marginBottom:8},
  mFields:{display:"flex",flexWrap:"wrap",gap:10},
  fg:{display:"flex",flexDirection:"column",gap:2},
  fl:{fontSize:10,fontWeight:700,color:"#9ca3af",textTransform:"uppercase",letterSpacing:0.4},
  ef:{fontSize:13,color:"#111827",cursor:"pointer",borderBottom:"1px dashed #d1d5db",padding:"2px 0",minWidth:30,display:"inline-block"},
  inlineInput:{fontSize:13,padding:"2px 6px",border:"2px solid #3b82f6",borderRadius:6,outline:"none",fontFamily:"inherit"},
  otag:{background:"#e5e7eb",color:"#374151",borderRadius:6,padding:"2px 8px",fontSize:12,fontWeight:700,whiteSpace:"nowrap",cursor:"pointer"},
  actBtn:{border:"none",borderRadius:8,padding:"4px 10px",fontSize:11,fontWeight:700,cursor:"pointer"},
  delBtn:{background:"#fef2f2",color:"#b91c1c",border:"1px solid #fecaca",borderRadius:7,padding:"4px 10px",fontSize:13,cursor:"pointer"},
  oPrompt:{textAlign:"center",padding:"60px 20px"},
  poBar:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10},
  poSum:{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:8,padding:"8px 14px",fontSize:13,color:"#166534",marginBottom:12},
  poRow:{borderRadius:10,padding:"12px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",border:"1px solid #e5e7eb"},
};
