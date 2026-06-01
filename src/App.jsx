import { useState, useEffect, useCallback, useRef } from "react";
import * as XLSX from "xlsx";
import { loadInventoryData, saveInventoryData } from "./storage";

// ── DEFAULT REFERENCE LISTS (seeded from your spreadsheet) ───────────────────
const DEFAULT_LOCATIONS = [
  { name: "Corner Far",           code: 1    },
  { name: "Corner",               code: 1.2  },
  { name: "Corner Under Fountain",code: 1.5  },
  { name: "Cabinets",             code: 2    },
  { name: "Coke Shelve",          code: 2.5  },
  { name: "Next to chip warmer",  code: 2.6  },
  { name: "Top Shelves",          code: 2.7  },
  { name: "Mueble 2",             code: 3    },
  { name: "Cashier area",         code: 3.3  },
  { name: "Cajon",                code: 3.4  },
  { name: "Can area",             code: 3.5  },
  { name: "Bar",                  code: 3.55 },
  { name: "Under Hand Sink",      code: 3.7  },
  { name: "Dish Washer Area",     code: 4    },
  { name: "Freezer",              code: 5    },
  { name: "Line Area",            code: 6    },
  { name: "Walk In",              code: 7    },
  { name: "Bathroom",             code: 8    },
];
const DEFAULT_CATEGORIES = ["Beverages","Canned Goods","Cleaning","Dairy","Dry Goods","Frozen","Paper Goods","Produce","Proteins","Supplies","Other"];
const DEFAULT_UNITS       = ["each","case","lbs","bags","boxes","gallons","oz","flats","bunches","cans","dozen","packs"];
const DEFAULT_VENDORS     = ["Restaurant Depot","Scotts"];

const SOURCE_ITEMS = [{"id":1,"storeOrder":1.0,"storeLocationNum":1030,"name":"Mexican Code 1/2L","location":"Corner Far","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":2,"storeOrder":1.0,"storeLocationNum":800,"name":"Sauce To-Go Container 4 Oz","location":"Corner Far","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":3,"storeOrder":1.0,"storeLocationNum":410,"name":"Queso Liquido","location":"Corner Far","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":4,"storeOrder":1.0,"storeLocationNum":1010,"name":"Canned Coke","location":"Corner Far","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":5,"storeOrder":1.0,"storeLocationNum":1000,"name":"Apple Juice","location":"Corner Far","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":6,"storeOrder":1.0,"storeLocationNum":1000,"name":"Mango Juice","location":"Corner Far","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":7,"storeOrder":1.0,"storeLocationNum":1000,"name":"Orange Juice","location":"Corner Far","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":8,"storeOrder":1.0,"storeLocationNum":990,"name":"Bottled Water","location":"Corner Far","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":9,"storeOrder":1.0,"storeLocationNum":990,"name":"Topo chico","location":"Corner Far","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":10,"storeOrder":1.0,"storeLocationNum":400,"name":"Chipotel En Adobo","location":"Corner Far","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":11,"storeOrder":1.0,"storeLocationNum":690,"name":"9\" Aluminum Round Containers","location":"Corner Far","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":12,"storeOrder":1.0,"storeLocationNum":700,"name":"7\" Aluminum Round Containers","location":"Corner Far","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":13,"storeOrder":1.0,"storeLocationNum":1150,"name":"Nopales","location":"Corner Far","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":14,"storeOrder":1.0,"storeLocationNum":670,"name":"To Go Soup Containers 24Oz","location":"Corner Far","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":15,"storeOrder":1.2,"storeLocationNum":780,"name":"Straws wrapped 10\"","location":"Corner","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":16,"storeOrder":1.2,"storeLocationNum":790,"name":"Lid for Sauce To-Go Container 4 Oz","location":"Corner","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":17,"storeOrder":1.2,"storeLocationNum":880,"name":"Sternos","location":"Corner","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":18,"storeOrder":1.2,"storeLocationNum":930,"name":"Serving Spoons Disposable","location":"Corner","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":19,"storeOrder":1.2,"storeLocationNum":940,"name":"Seving Forks Disposable","location":"Corner","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":20,"storeOrder":1.2,"storeLocationNum":950,"name":"Serving Tongs Disposable","location":"Corner","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":21,"storeOrder":1.2,"storeLocationNum":1230,"name":"Wire Chaffing Dishes","location":"Corner","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":22,"storeOrder":1.2,"storeLocationNum":1000,"name":"Diet Coke (can)","location":"Corner","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":23,"storeOrder":1.2,"storeLocationNum":1020,"name":"Canned Sprite","location":"Corner","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":24,"storeOrder":1.2,"storeLocationNum":680,"name":"Lids for 7\" Aluminum Round Containers","location":"Corner","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":25,"storeOrder":1.2,"storeLocationNum":670,"name":"Lids for 9\" Aluminum Round Containers","location":"Corner","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":26,"storeOrder":1.2,"storeLocationNum":850,"name":"Plastic Forks Heavy Weight","location":"Corner","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":27,"storeOrder":1.2,"storeLocationNum":450,"name":"Togo contenedores para flan","location":"Corner","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":28,"storeOrder":1.2,"storeLocationNum":380,"name":"Ketchup Bottles","location":"Corner","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":29,"storeOrder":1.2,"storeLocationNum":740,"name":"Burrito Paper (food Wrap) shts 12\"x12\"","location":"Corner","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":30,"storeOrder":1.2,"storeLocationNum":740,"name":"Burrito Paper (food Wrap) shts 9\"x12\"","location":"Corner","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":31,"storeOrder":1.2,"storeLocationNum":660,"name":"To Go Soup Containers 16 Oz","location":"Corner","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":32,"storeOrder":1.2,"storeLocationNum":650,"name":"To Go Cups 16 Oz for fountain TP16D","location":"Corner","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":33,"storeOrder":1.2,"storeLocationNum":650,"name":"Cups para horchata grande","location":"Corner","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":34,"storeOrder":1.2,"storeLocationNum":650,"name":"Lids para horchata grande","location":"Corner","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":35,"storeOrder":1.2,"storeLocationNum":650,"name":"Lids For Fountain Cups","location":"Corner","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":36,"storeOrder":1.5,"storeLocationNum":240,"name":"Glitter Cleaner para plancha","location":"Corner Under Fountain","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":37,"storeOrder":1.5,"storeLocationNum":1060,"name":"Lime Juice","location":"Corner Under Fountain","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":38,"storeOrder":2.0,"storeLocationNum":810,"name":"Lid for Sauce To-Go Container .75 Oz","location":"Cabinets","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":39,"storeOrder":2.0,"storeLocationNum":820,"name":"Sauce To-Go Container .75 Oz","location":"Cabinets","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":40,"storeOrder":2.0,"storeLocationNum":1070,"name":"Napkins","location":"Cabinets","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":41,"storeOrder":2.0,"storeLocationNum":450,"name":"Papel Para Impresora de enfrete","location":"Cabinets","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":42,"storeOrder":2.0,"storeLocationNum":450,"name":"Papel para impresora de cocina","location":"Cabinets","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":43,"storeOrder":2.0,"storeLocationNum":1160,"name":"Masking Tape","location":"Cabinets","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":44,"storeOrder":2.0,"storeLocationNum":460,"name":"Ketchup Packets","location":"Cabinets","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":45,"storeOrder":2.0,"storeLocationNum":490,"name":"Sugar (For Flan)","location":"Cabinets","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":46,"storeOrder":2.5,"storeLocationNum":960,"name":"4# Paper Bags","location":"Coke Shelve","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":47,"storeOrder":2.5,"storeLocationNum":970,"name":"6# Geocery Brown Paper Bags","location":"Coke Shelve","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":48,"storeOrder":2.6,"storeLocationNum":450,"name":"Cooking Oil","location":"Next to chip warmer","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":49,"storeOrder":2.6,"storeLocationNum":520,"name":"Salt","location":"Next to chip warmer","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":50,"storeOrder":2.7,"storeLocationNum":890,"name":"Aluminum Full Pans Deep","location":"Top Shelves","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":51,"storeOrder":2.7,"storeLocationNum":900,"name":"Aluminum Full Pans Medium","location":"Top Shelves","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":52,"storeOrder":2.7,"storeLocationNum":900,"name":"Aluminum Full Pans Shallow","location":"Top Shelves","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":53,"storeOrder":2.7,"storeLocationNum":900,"name":"Aluminum Half Pans Medium","location":"Top Shelves","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":54,"storeOrder":2.7,"storeLocationNum":900,"name":"Aluminum Half Pans Deep","location":"Top Shelves","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":55,"storeOrder":2.7,"storeLocationNum":910,"name":"Aluminum Full Pan Lids","location":"Top Shelves","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":56,"storeOrder":2.7,"storeLocationNum":920,"name":"Aluminum Half Pan Lids","location":"Top Shelves","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":57,"storeOrder":3.0,"storeLocationNum":980,"name":"20# Paper Bags Shorties","location":"Mueble 2","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":58,"storeOrder":3.0,"storeLocationNum":630,"name":"Bolsas Para Churros","location":"Mueble 2","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":59,"storeOrder":3.0,"storeLocationNum":450,"name":"Tinta para impresora de cocina","location":"Mueble 2","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":60,"storeOrder":3.0,"storeLocationNum":630,"name":"Cup carrier","location":"Mueble 2","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":61,"storeOrder":3.0,"storeLocationNum":450,"name":"Marg Mix","location":"Mueble 2","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":62,"storeOrder":3.0,"storeLocationNum":450,"name":"Tripple Sec","location":"Mueble 2","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":63,"storeOrder":3.0,"storeLocationNum":1170,"name":"Chamoy","location":"Mueble 2","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":64,"storeOrder":3.0,"storeLocationNum":720,"name":"Aluminium individual Wrap para burrito","location":"Mueble 2","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":65,"storeOrder":3.0,"storeLocationNum":730,"name":"Aluminum Large (18\"x500ft)","location":"Mueble 2","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":66,"storeOrder":3.0,"storeLocationNum":750,"name":"Plastic Wrap Large (18\"x2000ft)","location":"Mueble 2","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":67,"storeOrder":3.0,"storeLocationNum":760,"name":"Plastic Wrap Meduim (12in x 3000\")","location":"Mueble 2","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":68,"storeOrder":3.0,"storeLocationNum":450,"name":"Mango Flavor For Margs","location":"Bar","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":69,"storeOrder":3.0,"storeLocationNum":450,"name":"Strawberry Flavor For Margs","location":"Bar","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":70,"storeOrder":3.3,"storeLocationNum":2000,"name":"Sharpies","location":"Cashier area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":71,"storeOrder":3.4,"storeLocationNum":330,"name":"Tajin","location":"Cajon","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":72,"storeOrder":3.4,"storeLocationNum":860,"name":"Plastic Knives Heavy Weight","location":"Cajon","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":73,"storeOrder":3.4,"storeLocationNum":870,"name":"Plastic Spoons Heavy Weight","location":"Cajon","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":74,"storeOrder":3.4,"storeLocationNum":710,"name":"Tooth Picks","location":"Cajon","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":75,"storeOrder":3.5,"storeLocationNum":430,"name":"Crushed Tomatillo","location":"Can area","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":76,"storeOrder":3.5,"storeLocationNum":410,"name":"Sliced Jalapeños","location":"Can area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":77,"storeOrder":3.5,"storeLocationNum":420,"name":"Sliced Olives","location":"Can area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":78,"storeOrder":3.5,"storeLocationNum":1140,"name":"Salsa Mexicana Embassa","location":"Can area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":79,"storeOrder":3.5,"storeLocationNum":1250,"name":"White towles","location":"Can area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":80,"storeOrder":3.5,"storeLocationNum":470,"name":"Condensed Milk (For Flan)","location":"Can area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":81,"storeOrder":3.5,"storeLocationNum":480,"name":"Evaporated Milk (For Flan)","location":"Can area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":82,"storeOrder":3.5,"storeLocationNum":420,"name":"Chicken Stock (Caldo De pollo)","location":"Can area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":83,"storeOrder":3.55,"storeLocationNum":450,"name":"Tequila","location":"Bar","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":84,"storeOrder":3.55,"storeLocationNum":830,"name":"Latex Disposable Gloves-L","location":"Bar","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":85,"storeOrder":3.55,"storeLocationNum":840,"name":"Latex Disposable Gloves-M","location":"Bar","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":86,"storeOrder":3.55,"storeLocationNum":1240,"name":"To Go bags Big","location":"Bar","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":87,"storeOrder":3.7,"storeLocationNum":240,"name":"Sanitizing tablets","location":"Under Hand Sink","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":88,"storeOrder":3.7,"storeLocationNum":250,"name":"Glass Cleaner","location":"Under Hand Sink","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":89,"storeOrder":3.7,"storeLocationNum":260,"name":"Hand Soap","location":"Under Hand Sink","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":90,"storeOrder":4.0,"storeLocationNum":1130,"name":"Light Chilli Powder (New Mexico)","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":91,"storeOrder":4.0,"storeLocationNum":440,"name":"Fryer Oil Filters","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":92,"storeOrder":4.0,"storeLocationNum":280,"name":"Bleach","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":93,"storeOrder":4.0,"storeLocationNum":290,"name":"Pinesol","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":94,"storeOrder":4.0,"storeLocationNum":300,"name":"Green Scotch Brite","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":95,"storeOrder":4.0,"storeLocationNum":310,"name":"Steel Wool (esponja de metal)","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":96,"storeOrder":4.0,"storeLocationNum":320,"name":"Grill Brick","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":97,"storeOrder":4.0,"storeLocationNum":340,"name":"Tomato Bouillon With Chicken (Knorr)","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":98,"storeOrder":4.0,"storeLocationNum":350,"name":"Salsa Inglesa","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":99,"storeOrder":4.0,"storeLocationNum":360,"name":"Apple Cider Vinegar","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":100,"storeOrder":4.0,"storeLocationNum":390,"name":"Vanilla (For Flan)","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":101,"storeOrder":4.0,"storeLocationNum":530,"name":"Granulated Garlic","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":102,"storeOrder":4.0,"storeLocationNum":540,"name":"Groud Cumin","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":103,"storeOrder":4.0,"storeLocationNum":550,"name":"Ground Black Pepper","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":104,"storeOrder":4.0,"storeLocationNum":540,"name":"Marjoarn","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":105,"storeOrder":4.0,"storeLocationNum":540,"name":"Thyme","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":106,"storeOrder":4.0,"storeLocationNum":560,"name":"Beef Base","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"No","vendor":"Restaurant Depot","unit":"each","category":""},{"id":107,"storeOrder":4.0,"storeLocationNum":560,"name":"Ground Cinnamon","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":108,"storeOrder":4.0,"storeLocationNum":560,"name":"Red Chilli Flakes","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":109,"storeOrder":4.0,"storeLocationNum":580,"name":"Whole Mexican Oregano","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":110,"storeOrder":4.0,"storeLocationNum":590,"name":"Whole Pepper","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":111,"storeOrder":4.0,"storeLocationNum":600,"name":"Ground Cloves","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":112,"storeOrder":4.0,"storeLocationNum":610,"name":"Whole Cloves","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":113,"storeOrder":4.0,"storeLocationNum":770,"name":"Sandwich Bags for Portioning","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":114,"storeOrder":4.0,"storeLocationNum":1090,"name":"Taco Seasoning (McCormic)","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":115,"storeOrder":4.0,"storeLocationNum":1180,"name":"Achiote","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":116,"storeOrder":4.0,"storeLocationNum":1190,"name":"Guajillo","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":117,"storeOrder":4.0,"storeLocationNum":1200,"name":"New Mexico","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":118,"storeOrder":4.0,"storeLocationNum":1210,"name":"Pasilla","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":119,"storeOrder":4.0,"storeLocationNum":1220,"name":"Chile de Arbol","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":120,"storeOrder":4.0,"storeLocationNum":1290,"name":"Mole Paste","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":121,"storeOrder":4.0,"storeLocationNum":450,"name":"Crisco (all vegy shortening)","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":122,"storeOrder":4.0,"storeLocationNum":1040,"name":"Horchata Mix","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":123,"storeOrder":4.0,"storeLocationNum":500,"name":"Harina de tamales","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":124,"storeOrder":4.0,"storeLocationNum":570,"name":"Ground Paprika","location":"Dish Washer Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":125,"storeOrder":5.0,"storeLocationNum":160,"name":"Chicken Strips","location":"Freezer","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":126,"storeOrder":5.0,"storeLocationNum":150,"name":"Fries","location":"Freezer","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":127,"storeOrder":5.0,"storeLocationNum":210,"name":"Churros","location":"Freezer","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":128,"storeOrder":5.0,"storeLocationNum":2000,"name":"Pulpa de Aguacate","location":"Freezer","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":129,"storeOrder":5.0,"storeLocationNum":2000,"name":"Carne para menudo","location":"Freezer","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":130,"storeOrder":5.0,"storeLocationNum":80,"name":"Chorizo","location":"Freezer","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":131,"storeOrder":5.0,"storeLocationNum":210,"name":"Bacon 14/16 (tiras)","location":"Freezer","par":0,"reorder":0,"notes":"","frequency":2,"active":"No","vendor":"Restaurant Depot","unit":"each","category":""},{"id":132,"storeOrder":5.0,"storeLocationNum":230,"name":"Mahi Mahi Taco pieces","location":"Freezer","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":133,"storeOrder":5.0,"storeLocationNum":1110,"name":"Bread for Tortas","location":"Freezer","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":134,"storeOrder":6.0,"storeLocationNum":510,"name":"Hoja para tamal","location":"Line Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":135,"storeOrder":6.0,"storeLocationNum":30,"name":"Potatoes","location":"Line Area","par":0,"reorder":0,"notes":"","frequency":2,"active":"No","vendor":"Restaurant Depot","unit":"each","category":""},{"id":136,"storeOrder":6.0,"storeLocationNum":40,"name":"Yellow Onions","location":"Line Area","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":137,"storeOrder":6.0,"storeLocationNum":460,"name":"Frijoles","location":"Line Area","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":138,"storeOrder":6.0,"storeLocationNum":460,"name":"Parbroiled Rice","location":"Line Area","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":139,"storeOrder":6.0,"storeLocationNum":20,"name":"Avocado","location":"Line Area","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":140,"storeOrder":6.0,"storeLocationNum":620,"name":"To Go Boxes #1","location":"Line Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":141,"storeOrder":6.0,"storeLocationNum":630,"name":"To Go Boxes #3","location":"Line Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":142,"storeOrder":6.0,"storeLocationNum":640,"name":"To Go Boxes #8","location":"Line Area","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":143,"storeOrder":7.0,"storeLocationNum":10,"name":"Roma Tomatoes","location":"Walk In","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":144,"storeOrder":7.0,"storeLocationNum":50,"name":"Pineapple","location":"Walk In","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":145,"storeOrder":7.0,"storeLocationNum":90,"name":"Cilantro","location":"Walk In","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":146,"storeOrder":7.0,"storeLocationNum":110,"name":"Green Onion","location":"Walk In","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":147,"storeOrder":7.0,"storeLocationNum":120,"name":"Red Bell Peppers","location":"Walk In","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":148,"storeOrder":7.0,"storeLocationNum":120,"name":"Green Bell Peppers","location":"Walk In","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":149,"storeOrder":7.0,"storeLocationNum":120,"name":"Zuchinni Green","location":"Walk In","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":150,"storeOrder":7.0,"storeLocationNum":120,"name":"Squash Yellow","location":"Walk In","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":151,"storeOrder":7.0,"storeLocationNum":220,"name":"Huevo Liquido","location":"Walk In","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":152,"storeOrder":7.0,"storeLocationNum":130,"name":"Serranos","location":"Walk In","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":153,"storeOrder":7.0,"storeLocationNum":140,"name":"Iceberg Lettuce","location":"Walk In","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":154,"storeOrder":7.0,"storeLocationNum":170,"name":"Fancy Shred Jack Cheese Jack Chedar","location":"Walk In","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":155,"storeOrder":7.0,"storeLocationNum":170,"name":"Mozarela cheese","location":"Walk In","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":156,"storeOrder":7.0,"storeLocationNum":190,"name":"Boneless Skinless Chicken Thighs","location":"Walk In","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":157,"storeOrder":7.0,"storeLocationNum":200,"name":"Sour Cream Mexican Style","location":"Walk In","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":158,"storeOrder":7.0,"storeLocationNum":220,"name":"Large Eggs","location":"Walk In","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":159,"storeOrder":7.0,"storeLocationNum":70,"name":"Pealed Garlic","location":"Walk In","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":160,"storeOrder":7.0,"storeLocationNum":100,"name":"Jalapeños Fresh","location":"Walk In","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":161,"storeOrder":7.0,"storeLocationNum":60,"name":"Limes","location":"Walk In","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":162,"storeOrder":7.0,"storeLocationNum":180,"name":"Grated Queso Cotija","location":"Walk In","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":163,"storeOrder":7.0,"storeLocationNum":1100,"name":"Leche Para En Caja de Carton","location":"Walk In","par":0,"reorder":0,"notes":"","frequency":2,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":164,"storeOrder":7.0,"storeLocationNum":370,"name":"Mayonnaise","location":"Walk In","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":165,"storeOrder":8.0,"storeLocationNum":1260,"name":"Bags for Rice","location":"Bathroom","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":166,"storeOrder":8.0,"storeLocationNum":1270,"name":"White Garbage Bags 13 Gallons","location":"Bathroom","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":167,"storeOrder":8.0,"storeLocationNum":1280,"name":"Black Garbage bags","location":"Bathroom","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":168,"storeOrder":8.0,"storeLocationNum":270,"name":"Dawn Soap","location":"Bathroom","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":169,"storeOrder":8.0,"storeLocationNum":1050,"name":"Toilet Paper","location":"Bathroom","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""},{"id":170,"storeOrder":8.0,"storeLocationNum":1080,"name":"Paper Towels (GR-340)","location":"Bathroom","par":0,"reorder":0,"notes":"","frequency":1,"active":"Yes","vendor":"Restaurant Depot","unit":"each","category":""}];

const uid = () => Date.now().toString(36)+Math.random().toString(36).slice(2);

// ── UNIT HELPERS ──────────────────────────────────────────────────────────────
const needToOrder = (item, count) => {
  const n = parseFloat(count);
  if (isNaN(n)||count===""||count===undefined) return 0;
  const shortage = Math.max(0,(item.par||0)-n);
  if (!shortage) return 0;
  if (item.countPerOrderUnit && item.orderUnit) return Math.ceil(shortage/item.countPerOrderUnit);
  return shortage;
};
const orderUnitLabel = (item) => (item.countPerOrderUnit && item.orderUnit) ? item.orderUnit : item.unit;
const countUnitLabel = (item) => item.unit;
const statusOf = (count,par,reorder) => {
  if (count===""||count===null||count===undefined) return "neutral";
  const n=parseFloat(count);
  if(n<=(reorder||0)) return "critical";
  if(n<(par||0)*0.6) return "low";
  return "good";
};
const SC={critical:"#ef4444",low:"#f59e0b",good:"#22c55e",neutral:"#d1d5db"};

function exportAll(items, counts, locations, categories, units, vendors){
  const wb = XLSX.utils.book_new();
  // Sheet 1: Inventory
  const rows=[...items].sort((a,b)=>a.storeOrder-b.storeOrder).map(item=>({
    "ID":item.id,
    "In-House Location #":item.storeOrder,
    "Store Location #":item.storeLocationNum,
    "Item Name":item.name,
    "In-House Location":item.location,
    "Category":item.category,
    "Unit":item.unit,
    "Order Unit":item.orderUnit||"",
    "Per Order Unit":item.countPerOrderUnit||"",
    "To Have (Par)":item.par||"",
    "Reorder Point":item.reorder||"",
    "On Hand (Last Count)":counts[item.id]!==undefined?counts[item.id]:"",
    "Need To Order":counts[item.id]!==undefined?(needToOrder(item,counts[item.id])||""):"",
    "Frequency":item.frequency,
    "Active":item.active,
    "Vendor":item.vendor,
    "Notes":item.notes,
  }));
  const invWs=XLSX.utils.json_to_sheet(rows);
  invWs["!cols"]=[10,10,12,32,20,14,8,10,10,10,10,14,12,8,6,16,20].map(w=>({wch:w}));
  XLSX.utils.book_append_sheet(wb, invWs, "Inventory");
  // Sheet 2: In-House Location
  const locWs = XLSX.utils.json_to_sheet(locations.map(l=>({ "In-House Location": l.name, "In-House Location #": l.code })));
  locWs["!cols"] = [{ wch: 28 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(wb, locWs, "In-House Location");
  // Sheet 3: Vendor
  const vendorWs = XLSX.utils.json_to_sheet(vendors.map(v=>({ Vendor: v })));
  vendorWs["!cols"] = [{ wch: 24 }];
  XLSX.utils.book_append_sheet(wb, vendorWs, "Vendor");
  // Sheet 4: Category
  const catWs = XLSX.utils.json_to_sheet(categories.map(c=>({ Category: c })));
  catWs["!cols"] = [{ wch: 20 }];
  XLSX.utils.book_append_sheet(wb, catWs, "Category");
  // Sheet 5: Units
  const unitWs = XLSX.utils.json_to_sheet(units.map(u=>({ Unit: u })));
  unitWs["!cols"] = [{ wch: 16 }];
  XLSX.utils.book_append_sheet(wb, unitWs, "Units");
  XLSX.writeFile(wb, `inventory-${new Date().toISOString().slice(0,10)}.xlsx`);
}

function openPO(orderItems, date){
  // Group by vendor, within each vendor sort by storeOrder (location code)
  const vendorMap = {};
  orderItems.forEach(item => {
    const v = item.vendor || "Other";
    if (!vendorMap[v]) vendorMap[v] = [];
    vendorMap[v].push(item);
  });
  // Sort vendors alphabetically, items within each vendor by location code
  const vendors = Object.keys(vendorMap).sort();
  vendors.forEach(v => vendorMap[v].sort((a,b) => (a.storeOrder||0) - (b.storeOrder||0)));

  // Unit abbreviations for compact text
  const abbr = (unit) => {
    const map = {
      each:"ea", case:"cs", lbs:"lb", bags:"bg", boxes:"bx",
      gallons:"gl", oz:"oz", flats:"fl", bunches:"bn",
      cans:"cn", dozen:"dz", packs:"pk",
    };
    return map[unit?.toLowerCase()] || unit || "ea";
  };

  // Build plain text version — compact for texting
  let plain = `Purchase Order\n${date}\n`;
  vendors.forEach((vendor, vi) => {
    plain += `\n${vendor.toUpperCase()}\n`;
    vendorMap[vendor].forEach(item => {
      const unit = abbr(orderUnitLabel(item));
      plain += `${item.toOrder}${unit} ${item.name}\n`;
    });
  });

  // Build HTML rows grouped by vendor
  let htmlBody = "";
  vendors.forEach(vendor => {
    htmlBody += `<div class="vendor-header">${escapeHtml(vendor)}</div>`;
    vendorMap[vendor].forEach(item => {
      const isCritical = parseFloat(item.count||0) <= (item.reorder||0);
      htmlBody += `<div class="item-row${isCritical?" critical":""}">
        <span class="qty">${escapeHtml(item.toOrder)}</span>
        <span class="unit">${escapeHtml(orderUnitLabel(item))}</span>
        <span class="name">${escapeHtml(item.name)}</span>
      </div>`;
    });
  });

  const plainEscaped = plain.replace(/\\/g,"\\\\").replace(/`/g,"\\`");
  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Purchase Order — ${escapeHtml(date)}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:system-ui,sans-serif;background:#f8f8f6;color:#111827;padding:24px 20px 60px}
    h1{font-size:20px;font-weight:700;margin-bottom:2px}
    .date{font-size:13px;color:#6b7280;margin-bottom:20px}
    .vendor-header{font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;
      color:#fff;background:#1a1a2e;padding:6px 14px;border-radius:8px 8px 0 0;margin-top:16px}
    .item-row{display:flex;align-items:baseline;gap:0;padding:9px 14px;background:#fff;
      border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb}
    .item-row:last-of-type{border-radius:0 0 8px 8px;margin-bottom:4px}
    .item-row.critical{background:#fff5f5}
    .qty{font-size:18px;font-weight:700;color:#1a1a2e;min-width:40px;text-align:right;margin-right:10px}
    .unit{font-size:13px;color:#6b7280;min-width:52px;margin-right:10px}
    .name{font-size:15px;color:#111827}
    .copy-bar{position:fixed;bottom:0;left:0;right:0;background:#fff;border-top:1px solid #e5e7eb;
      padding:12px 20px;display:flex;gap:10px;align-items:center}
    .copy-btn{background:#1a1a2e;color:#fff;border:none;border-radius:10px;padding:10px 24px;
      font-size:14px;font-weight:700;cursor:pointer;flex:1}
    .copy-btn:active{opacity:0.8}
    .copy-notice{font-size:13px;color:#16a34a;font-weight:600;opacity:0;transition:opacity 0.3s}
    .copy-notice.show{opacity:1}
    .total{font-size:12px;color:#6b7280;margin-top:16px;text-align:right}
  </style>
</head>
<body>
  <h1>Purchase Order</h1>
  <div class="date">${escapeHtml(date)}</div>
  ${htmlBody}
  <div class="total">${orderItems.length} items across ${vendors.length} vendor${vendors.length!==1?"s":""}</div>
  <div class="copy-bar">
    <button class="copy-btn" onclick="copyText()">📋 Copy as Plain Text</button>
    <span class="copy-notice" id="notice">Copied!</span>
  </div>
  <script>
    const plainText = \`${plainEscaped}\`;
    function copyText(){
      navigator.clipboard.writeText(plainText).then(()=>{
        const n=document.getElementById('notice');
        n.classList.add('show');
        setTimeout(()=>n.classList.remove('show'),2000);
      }).catch(()=>{
        const ta=document.createElement('textarea');
        ta.value=plainText;ta.style.position='fixed';ta.style.opacity='0';
        document.body.appendChild(ta);ta.select();document.execCommand('copy');
        document.body.removeChild(ta);
        const n=document.getElementById('notice');
        n.classList.add('show');
        setTimeout(()=>n.classList.remove('show'),2000);
      });
    }
  </script>
</body>
</html>`;

  const win = window.open("", "_blank");
  win.document.write(html);
  win.document.close();
}

function escapeHtml(value){
  return String(value??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
}

function EditCell({value,onSave,type="text",options=null,width=100}){
  const [v,setV]=useState(String(value??""));
  const ref=useRef();
  useEffect(()=>{try{ref.current?.focus();ref.current?.select();}catch(e){}},[]);
  const commit=()=>{try{onSave(type==="number"?(parseFloat(v)||0):v);}catch(e){}};
  if(options){
    const allOptions=options.includes(v)?options:[v,...options];
    return(<select ref={ref} value={v} style={{...s.inlineInput,width}} onChange={e=>{setV(e.target.value);onSave(e.target.value);}} onBlur={commit}>{allOptions.map(o=><option key={o} value={o}>{o||"—"}</option>)}</select>);
  }
  return(<input ref={ref} value={v} type={type==="number"?"number":"text"} style={{...s.inlineInput,width}} onChange={e=>setV(e.target.value)} onBlur={commit} onKeyDown={e=>{if(e.key==="Enter")commit();if(e.key==="Escape")onSave(null);}}/>);
}

// ── LIST TAB HELPERS ─────────────────────────────────────────────────────────
function ListSection({ title, subtitle, onAdd, children }) {
  return (
    <div style={{marginBottom:20}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
        <div>
          <div style={{fontWeight:700,fontSize:14,color:"#111827"}}>{title}</div>
          {subtitle&&<div style={{fontSize:11,color:"#9ca3af",marginTop:1}}>{subtitle}</div>}
        </div>
        <button style={{background:"#1a1a2e",color:"#fff",border:"none",borderRadius:8,
          padding:"6px 14px",fontSize:12,fontWeight:600,cursor:"pointer"}}
          onClick={onAdd}>+ Add</button>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {children}
      </div>
    </div>
  );
}

function InlineEdit({ value, onSave, type="text", width=160, label }) {
  const [editing, setEditing] = useState(false);
  const [v, setV] = useState(String(value ?? ""));
  const ref = useRef();
  useEffect(() => { if (editing) { ref.current?.focus(); ref.current?.select(); } }, [editing]);
  const commit = () => { setEditing(false); if (String(v).trim() !== String(value)) onSave(type==="number" ? parseFloat(v)||0 : v.trim()); };
  if (editing) {
    return (
      <input ref={ref} value={v} type={type==="number"?"number":"text"}
        style={{fontSize:16,padding:"4px 8px",border:"2px solid #3b82f6",borderRadius:6,
          outline:"none",fontFamily:"inherit",width,boxSizing:"border-box"}}
        onChange={e=>setV(e.target.value)}
        onBlur={commit}
        onKeyDown={e=>{ if(e.key==="Enter") commit(); if(e.key==="Escape"){ setV(String(value??"")); setEditing(false); }}}
      />
    );
  }
  return (
    <span onClick={()=>{ setV(String(value??"")); setEditing(true); }}
      style={{fontSize:13,color:"#111827",cursor:"pointer",padding:"4px 8px",
        borderRadius:6,border:"1px dashed #d1d5db",background:"#fafafa",
        minWidth:width,display:"inline-block",boxSizing:"border-box"}}>
      {label&&<span style={{fontSize:10,color:"#9ca3af",fontWeight:700,textTransform:"uppercase",marginRight:6}}>{label}</span>}
      {value||<span style={{color:"#9ca3af",fontStyle:"italic"}}>tap to edit</span>}
    </span>
  );
}

export default function App(){
  const [items,setItems]=useState(SOURCE_ITEMS);
  const [counts,setCounts]=useState({});
  const [locations,setLocations]=useState(DEFAULT_LOCATIONS);
  const [categories,setCategories]=useState(DEFAULT_CATEGORIES);
  const [units,setUnits]=useState(DEFAULT_UNITS);
  const [vendors,setVendors]=useState(DEFAULT_VENDORS);
  const [view,setView]=useState("count");
  const [search,setSearch]=useState("");
  const [filterLoc,setFilterLoc]=useState("All");
  const [filterActive,setFilterActive]=useState("Active");
  const [countedOnly,setCountedOnly]=useState(false);
  const [editingCell,setEditingCell]=useState(null);
  const [saved,setSaved]=useState(false);
  const [importStatus,setImportStatus]=useState(null);
  const importRef=useRef();
  const date=new Date().toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"});

  // Helper: look up location code by name
  const locCode = (name) => locations.find(l=>l.name===name)?.code ?? null;
  const locationNames = locations.map(l=>l.name);

  useEffect(() => {
    loadInventoryData().then((d) => {
      if (d?.lists) {
        if (d.lists.locations?.length) setLocations(d.lists.locations);
        if (d.lists.categories?.length) setCategories(d.lists.categories);
        if (d.lists.units?.length) setUnits(d.lists.units);
        if (d.lists.vendors?.length) setVendors(d.lists.vendors);
      }
      if (d?.items && d.items.length > 0) {
        setItems(d.items);
      }
      if (d?.counts) {
        setCounts(d.counts);
      }
    });
  }, []);

  const persistAll = useCallback((ni,nc,nloc,ncat,nunit,nvend) => {
    const li = nloc ?? locations;
    const ca = ncat ?? categories;
    const un = nunit ?? units;
    const ve = nvend ?? vendors;
    setItems(ni); setCounts(nc);
    if(nloc) setLocations(nloc);
    if(ncat) setCategories(ncat);
    if(nunit) setUnits(nunit);
    if(nvend) setVendors(nvend);
    saveInventoryData({ items:ni, counts:nc, lists:{ locations:li, categories:ca, units:un, vendors:ve } });
    setSaved(true); setTimeout(()=>setSaved(false),1500);
  }, [locations,categories,units,vendors]);

  const persist = useCallback((ni,nc) => persistAll(ni,nc,null,null,null,null), [persistAll]);

  // When location changes on an item, auto-update storeOrder from location code
  const updateField = (id, field, value) => {
    if (value===null) { setEditingCell(null); return; }
    let extra = {};
    if (field==="location") {
      const code = locCode(value);
      if (code !== null) extra = { storeOrder: code };
    }
    persist(items.map(i=>i.id===id?{...i,[field]:value,...extra}:i), counts);
    setEditingCell(null);
  };
  const updateCount=(id,val)=>persist(items,{...counts,[id]:val});
  const deleteItem=(id)=>{if(!confirm("Delete this item?"))return;persist(items.filter(i=>i.id!==id),counts);};
  const addItem=()=>{
    const defaultLoc = locations[0];
    const item={id:uid(),storeOrder:defaultLoc?.code??1,storeLocationNum:0,name:"New Item",
      location:defaultLoc?.name??"Other",category:"",unit:units[0]??"each",par:0,reorder:0,
      notes:"",frequency:1,active:"Yes",vendor:vendors[0]??"Restaurant Depot"};
    persist([...items,item],counts);
  };

  // ── IMPORT (single file — reads Inventory sheet + all list sheets) ────────
  function handleImport(e){
    const file=e.target.files?.[0]; if(!file)return; e.target.value="";
    const reader=new FileReader();
    reader.onload=(evt)=>{
      try{
        const wb=XLSX.read(evt.target.result,{type:"array"});

        // ── List sheets (optional — only update if sheet is present) ──────
        let newLoc=locations, newCat=categories, newUnit=units, newVend=vendors;
        const locSheet=wb.Sheets["In-House Location"];
        if(locSheet){
          const rows=XLSX.utils.sheet_to_json(locSheet);
          const parsed=rows.map(r=>({name:String(r["In-House Location"]||"").trim(),code:Number(r["In-House Location #"])||0})).filter(r=>r.name);
          if(parsed.length) newLoc=parsed;
        }
        const vendSheet=wb.Sheets["Vendor"];
        if(vendSheet){
          const rows=XLSX.utils.sheet_to_json(vendSheet);
          const parsed=rows.map(r=>String(r["Vendor"]||"").trim()).filter(Boolean);
          if(parsed.length) newVend=parsed;
        }
        const catSheet=wb.Sheets["Category"];
        if(catSheet){
          const rows=XLSX.utils.sheet_to_json(catSheet);
          const parsed=rows.map(r=>String(r["Category"]||"").trim()).filter(Boolean);
          if(parsed.length) newCat=parsed;
        }
        const unitSheet=wb.Sheets["Units"];
        if(unitSheet){
          const rows=XLSX.utils.sheet_to_json(unitSheet);
          const parsed=rows.map(r=>String(r["Unit"]||r["Count Unit"]||"").trim()).filter(Boolean);
          if(parsed.length) newUnit=parsed;
        }

        // ── Inventory sheet — full replace ────────────────────────────────
        const invSheet=wb.Sheets["Inventory"]||wb.Sheets[wb.SheetNames[0]];
        const rows=XLSX.utils.sheet_to_json(invSheet);
        // Build name→id fallback for items that have no ID column yet
        const idByName={};
        items.forEach(i=>{idByName[i.name.toLowerCase().trim()]=i.id;});
        const newItems=[];
        rows.forEach(row=>{
          const name=String(row["Item Name"]||"").trim(); if(!name)return;
          const str=(k)=>{const v=row[k];return v!==undefined&&v!==""?String(v).trim():undefined;};
          const num=(k)=>{const v=row[k],n=Number(v);return v!==undefined&&v!==""&&!isNaN(n)?n:undefined;};
          // Prefer ID from spreadsheet, then existing name-matched ID, then generate new
          const resolvedId = str("ID") || idByName[name.toLowerCase()] || uid();
          newItems.push({
            id: resolvedId,
            name,
            storeOrder:      num("In-House Location #")??newItems.length+1,
            storeLocationNum:num("Store Location #")??0,
            par:             num("To Have (Par)")??0,
            reorder:         num("Reorder Point")??0,
            countPerOrderUnit:num("Per Order Unit"),
            location:        str("In-House Location")??newLoc[0]?.name??"Other",
            category:        str("Category")??"",
            unit:            str("Unit")??newUnit[0]??"each",
            orderUnit:       str("Order Unit"),
            active:          str("Active")??"Yes",
            vendor:          str("Vendor")??newVend[0]??"Restaurant Depot",
            notes:           str("Notes")??"",
            frequency:       num("Frequency")??1,
          });
        });

        // Clean up counts — remove any that belonged to deleted items
        const newIds=new Set(newItems.map(i=>i.id));
        const cleanedCounts=Object.fromEntries(Object.entries(counts).filter(([k])=>newIds.has(k)));

        persistAll(newItems,cleanedCounts,newLoc,newCat,newUnit,newVend);
        setImportStatus({total:newItems.length});
        setTimeout(()=>setImportStatus(null),4000);
      }catch(err){alert("Import failed: "+err.message);}
    };
    reader.readAsArrayBuffer(file);
  }

  const sorted=[...items].sort((a,b)=>a.storeOrder-b.storeOrder);
  const filtered=sorted.filter(item=>{
    if(search&&!item.name.toLowerCase().includes(search.toLowerCase()))return false;
    if(filterLoc!=="All"&&item.location!==filterLoc)return false;
    if(countedOnly&&(counts[item.id]===undefined||counts[item.id]===""))return false;
    return true;
  });
  const filteredManage=[...filtered].sort((a,b)=>a.storeOrder-b.storeOrder);
  const countedCount=Object.values(counts).filter(v=>v!=="").length;
  const orderItems=sorted
    .filter(i=>i.active==="Yes" && counts[i.id]!=="" && counts[i.id]!==undefined)
    .map(i=>({...i,count:counts[i.id],toOrder:needToOrder(i,counts[i.id])}))
    .filter(i=>i.toOrder>0)
    .sort((a,b)=>a.storeOrder-b.storeOrder);
  const isEditing=(id,field)=>editingCell?.itemId===id&&editingCell?.field===field;

  function handlePO(){ openPO(orderItems, date); }
  

  return(
    <div style={s.app}>
      <input ref={importRef} type="file" accept=".xlsx,.xls" style={{display:"none"}} onChange={handleImport}/>

      <div style={s.header}>
        <div style={s.hL}><span style={{fontSize:24}}>🍽️</span><div><div style={s.title}>Rio Bravito Inventory</div><div style={s.sub}>{date}</div></div></div>
        <div style={s.hR}>
          {saved&&<span style={s.savedBadge}>✓ Saved</span>}
          {importStatus&&<span style={s.importBadge}>{importStatus.total!==undefined?`✓ ${importStatus.total} items loaded`:"✓ Lists updated"}</span>}
          <div style={s.prog}><div style={s.progBar}><div style={{...s.progFill,width:`${items.length?(countedCount/items.length)*100:0}%`}}/></div><span style={s.progLbl}>{countedCount}/{items.length}</span></div>
        </div>
      </div>

      <div style={s.nav}>
        {[["count","📋 Count"],["manage","⚙️ Manage"],["order",`🛒 Order${orderItems.length?` (${orderItems.length})`:""}`],["lists","📂 Lists"]].map(([v,l])=>(
          <button key={v} style={{...s.navBtn,...(view===v?s.navA:{})}} onClick={()=>setView(v)}>{l}</button>
        ))}
      </div>

      {/* ── COUNT TAB ── */}
      {view==="count"&&(
        <div style={s.content}>
          <div style={s.toolbar}>
            <input style={s.search} placeholder="🔍 Search items..." value={search} onChange={e=>setSearch(e.target.value)}/>
            <div style={s.fRow}>
              <select style={s.sel} value={filterLoc} onChange={e=>setFilterLoc(e.target.value)}>
                <option value="All">All Locations</option>
                {[...locations].sort((a,b)=>a.code-b.code).map(l=><option key={l.name} value={l.name}>{l.code} · {l.name}</option>)}
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
              const cLabel=countUnitLabel(item), oLabel=orderUnitLabel(item);
              const code=locCode(item.location);
              return(
                <div key={item.id} style={{...s.card,borderLeft:`4px solid ${SC[st]}`,opacity:item.active==="No"?0.55:1}}>
                  <div style={s.iName}>{item.name}{item.active==="No"&&<span style={s.inactBadge}>INACTIVE</span>}</div>
                  <div style={s.metaRow}>
                    <span style={s.locBadge}>📍 {code!==null&&<b>{code} · </b>}{item.location}</span>
                    {item.category&&<span style={s.catBadge}>{item.category}</span>}
                    <span style={s.mTxt}>Par: <b>{item.par||"—"} {cLabel}</b></span>
                    <span style={s.mTxt}>Reorder at: <b>{item.reorder||"—"}</b></span>
                    {item.countPerOrderUnit&&item.orderUnit&&<span style={s.mTxt}>Orders by: <b>{item.countPerOrderUnit} {cLabel} = 1 {oLabel}</b></span>}
                    {item.notes&&<span style={s.noteTxt}>📝 {item.notes}</span>}
                  </div>
                  <div style={s.qtyLbl}>📥 QTY ON HAND ({cLabel}):</div>
                  <div style={s.cRow}>
                    <button style={s.nudge} onClick={()=>updateCount(item.id,Math.max(0,(parseFloat(val)||0)-1))}>−</button>
                    <input style={{...s.cIn,background:st==="critical"?"#fff0f0":st==="low"?"#fffbf0":val!==""?"#f0fff4":"#fff",borderColor:val===""?"#f59e0b":SC[st]}} type="number" min="0" placeholder="—" value={val} onChange={e=>updateCount(item.id,e.target.value)}/>
                    <button style={s.nudge} onClick={()=>updateCount(item.id,(parseFloat(val)||0)+1)}>+</button>
                    <span style={s.uLbl}>{cLabel}</span>
                  </div>
                  {val===""&&<div style={s.uncounted}>👆 Tap box above to enter how many you have</div>}
                  {val!==""&&parseFloat(val)<=(item.reorder||0)&&<div style={s.alertB}>⚠️ Below reorder point — need to order {needToOrder(item,val)} {oLabel}</div>}
                </div>
              );
            })}
            {filtered.length===0&&<div style={s.empty}>No items match your filters.</div>}
          </div>
          <div style={s.fab}>
            <button style={s.fabBtn} onClick={handlePO} disabled={orderItems.length===0}>
              {orderItems.length===0?"✅ All Stocked — Nothing to Order":`📄 Generate Purchase Order (${orderItems.length} items)`}
            </button>
          </div>
        </div>
      )}

      {/* ── MANAGE TAB ── */}
      {view==="manage"&&(
        <div style={s.content}>
          <div style={s.mHeader}>
            <div><div style={{fontWeight:700,fontSize:15}}>Item Management</div><div style={{fontSize:11,color:"#6b7280"}}>{items.length} items · Tap any field to edit</div></div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",justifyContent:"flex-end"}}>
              <button style={s.importBtn} onClick={()=>importRef.current.click()}>⬆️ Import</button>
              <button style={s.xlsBtn}    onClick={()=>exportAll(items,counts,locations,categories,units,vendors)}>⬇️ Export</button>
              <button style={s.addBtn}    onClick={addItem}>+ Add</button>
            </div>
          </div>
          <div style={s.importHint}>
            💡 <b>Workflow:</b> Export → edit in Excel → Import. The Inventory sheet fully replaces the current list — items not in the file are removed. List sheets (locations, vendors, etc.) update only what's present.
          </div>
          <div style={s.toolbar}>
            <input style={s.search} placeholder="🔍 Search..." value={search} onChange={e=>setSearch(e.target.value)}/>
            <div style={s.fRow}>
              <select style={s.sel} value={filterLoc} onChange={e=>setFilterLoc(e.target.value)}>
                <option value="All">All Locations</option>
                {[...locations].sort((a,b)=>a.code-b.code).map(l=><option key={l.name} value={l.name}>{l.code} · {l.name}</option>)}
              </select>
              <select style={s.sel} value={filterActive} onChange={e=>setFilterActive(e.target.value)}>
                <option value="Active">Active</option><option value="All">All</option><option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8,paddingBottom:20}}>
            {filteredManage.map(item=>(
              <div key={item.id} style={{...s.mCard,opacity:item.active==="No"?0.6:1}}>
                <div style={s.mTop}>
                  <div style={s.fg}>
                    <div style={s.fl}>Loc #</div>
                    <span style={{...s.otag,background:"#dbeafe",color:"#1e40af"}}>{item.storeOrder}</span>
                  </div>
                  <div style={{...s.fg,flex:1}}>
                    <div style={s.fl}>Item Name</div>
                    {isEditing(item.id,"name")?<EditCell value={item.name} width={190} onSave={v=>updateField(item.id,"name",v)}/>:<span style={s.ef} onClick={()=>setEditingCell({itemId:item.id,field:"name"})}>{item.name}</span>}
                  </div>
                  <button style={{...s.actBtn,background:item.active==="Yes"?"#dcfce7":"#fee2e2",color:item.active==="Yes"?"#166534":"#991b1b"}} onClick={()=>updateField(item.id,"active",item.active==="Yes"?"No":"Yes")}>{item.active==="Yes"?"Active":"Inactive"}</button>
                  <button style={s.delBtn} onClick={()=>deleteItem(item.id)}>✕</button>
                </div>
                <div style={s.mFields}>
                  {/* Location dropdown — auto-fills code */}
                  <div style={s.fg}>
                    <div style={s.fl}>Location</div>
                    {isEditing(item.id,"location")
                      ? <EditCell value={item.location} options={[...locationNames].sort()} width={160}
                          onSave={v=>updateField(item.id,"location",v)}/>
                      : <span style={s.ef} onClick={()=>setEditingCell({itemId:item.id,field:"location"})}>
                          {locCode(item.location)!==null&&<span style={{color:"#6b7280",fontSize:11}}>{locCode(item.location)} · </span>}{item.location||"—"}
                        </span>}
                  </div>
                  {/* Store Location # (manual override) */}
                  <div style={s.fg}>
                    <div style={s.fl}>Store Loc #</div>
                    {isEditing(item.id,"storeLocationNum")?<EditCell value={item.storeLocationNum} type="number" width={65} onSave={v=>updateField(item.id,"storeLocationNum",v)}/>:<span style={s.otag} onClick={()=>setEditingCell({itemId:item.id,field:"storeLocationNum"})}>{item.storeLocationNum}</span>}
                  </div>
                  {/* Category */}
                  <div style={s.fg}>
                    <div style={s.fl}>Category</div>
                    {isEditing(item.id,"category")?<EditCell value={item.category} options={["", ...categories]} width={120} onSave={v=>updateField(item.id,"category",v)}/>:<span style={s.ef} onClick={()=>setEditingCell({itemId:item.id,field:"category"})}>{item.category||"—"}</span>}
                  </div>
                  {/* Unit */}
                  <div style={s.fg}>
                    <div style={s.fl}>Unit</div>
                    {isEditing(item.id,"unit")?<EditCell value={item.unit} options={units} width={90} onSave={v=>updateField(item.id,"unit",v)}/>:<span style={s.ef} onClick={()=>setEditingCell({itemId:item.id,field:"unit"})}>{item.unit||"—"}</span>}
                  </div>
                  {/* Order Unit */}
                  <div style={s.fg}>
                    <div style={s.fl}>Order Unit</div>
                    {isEditing(item.id,"orderUnit")?<EditCell value={item.orderUnit||"(same as unit)"} options={["(same as unit)",...units]} width={110} onSave={v=>updateField(item.id,"orderUnit",v==="(same as unit)"?"":v)}/>:<span style={s.ef} onClick={()=>setEditingCell({itemId:item.id,field:"orderUnit"})}>{item.orderUnit||"(same)"}</span>}
                  </div>
                  {/* Vendor */}
                  <div style={s.fg}>
                    <div style={s.fl}>Vendor</div>
                    {isEditing(item.id,"vendor")?<EditCell value={item.vendor} options={vendors} width={140} onSave={v=>updateField(item.id,"vendor",v)}/>:<span style={s.ef} onClick={()=>setEditingCell({itemId:item.id,field:"vendor"})}>{item.vendor||"—"}</span>}
                  </div>
                  {/* Numeric fields */}
                  {[["par","Par","number",60],["reorder","Reorder At","number",60],["countPerOrderUnit","Per Order Unit","number",60]].map(([field,label,type,w])=>(
                    <div key={field} style={s.fg}><div style={s.fl}>{label}</div>
                      {isEditing(item.id,field)?<EditCell value={item[field]??""} type={type} width={w} onSave={v=>updateField(item.id,field,v)}/>:<span style={s.ef} onClick={()=>setEditingCell({itemId:item.id,field})}>{item[field]||"—"}</span>}
                    </div>
                  ))}
                  {/* Notes */}
                  <div style={s.fg}><div style={s.fl}>Notes</div>
                    {isEditing(item.id,"notes")?<EditCell value={item.notes??""} width={180} onSave={v=>updateField(item.id,"notes",v)}/>:<span style={s.ef} onClick={()=>setEditingCell({itemId:item.id,field:"notes"})}>{item.notes||"—"}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ORDER TAB ── */}
      {view==="order"&&(
        <div style={s.content}>
          {orderItems.length===0?(
            <div style={s.oPrompt}>
              <div style={{fontSize:52,marginBottom:12}}>✅</div>
              <p style={{color:"#6b7280",fontSize:15,marginBottom:8}}>All counted items are at or above par.</p>
              <p style={{color:"#9ca3af",fontSize:13}}>Count items on the Count tab to see what needs ordering.</p>
            </div>
          ):(
            <div style={{paddingBottom:100}}>
              {/* Summary cards by vendor */}
              {[...new Set(orderItems.map(i=>i.vendor||"Other"))].sort().map(vendor=>{
                const vendorItems=orderItems.filter(i=>(i.vendor||"Other")===vendor);
                return(
                  <div key={vendor} style={{marginBottom:16}}>
                    <div style={s.vendorHeader}>{vendor}</div>
                    {vendorItems.map(item=>(
                      <div key={item.id} style={{...s.poRow,background:parseFloat(item.count)<=(item.reorder||0)?"#fff5f5":"#fff"}}>
                        <div>
                          <span style={{fontWeight:700,fontSize:15,color:"#1a1a2e",marginRight:8}}>{item.toOrder}</span>
                          <span style={{fontSize:13,color:"#6b7280",marginRight:10}}>{orderUnitLabel(item)}</span>
                          <span style={{fontSize:14,color:"#111827"}}>{item.name}</span>
                        </div>
                        {parseFloat(item.count)<=(item.reorder||0)&&<span style={{fontSize:10,color:"#b91c1c",fontWeight:700,background:"#fee2e2",padding:"2px 6px",borderRadius:6}}>CRITICAL</span>}
                      </div>
                    ))}
                  </div>
                );
              })}
              <div style={s.fab}>
                <button style={s.fabBtn} onClick={handlePO}>
                  📄 Open Purchase Order ({orderItems.length} items)
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {/* ── LISTS TAB ── */}
      {view==="lists"&&(
        <div style={{...s.content,paddingBottom:40}}>
          <div style={{fontSize:12,color:"#6b7280",marginBottom:12,textAlign:"left"}}>
            Tap any value to edit it inline. Changes save immediately and update all dropdowns.
          </div>

          {/* ── IN-HOUSE LOCATIONS ── */}
          <ListSection
            title="In-House Locations"
            subtitle="Each location has a sort code — items sort by this in the Count tab"
            onAdd={()=>{
              const newLoc=[...locations,{name:"New Location",code:9}];
              persistAll(items,counts,newLoc,categories,units,vendors);
            }}
          >
            {[...locations].sort((a,b)=>a.code-b.code).map((loc,i)=>(
              <div key={i} style={s.listRow}>
                <div style={{display:"flex",alignItems:"center",gap:8,flex:1,flexWrap:"wrap"}}>
                  <InlineEdit
                    value={loc.code}
                    type="number"
                    width={55}
                    label="Code"
                    onSave={v=>{
                      const nl=locations.map((l,j)=>j===locations.indexOf(loc)?{...l,code:Number(v)||0}:l);
                      persistAll(items,counts,[...nl].sort((a,b)=>a.code-b.code),categories,units,vendors);
                    }}
                  />
                  <InlineEdit
                    value={loc.name}
                    width={180}
                    label="Name"
                    onSave={v=>{
                      const oldName=loc.name;
                      const nl=locations.map((l,j)=>j===locations.indexOf(loc)?{...l,name:v}:l);
                      // Update any items that used the old location name
                      const ni=items.map(item=>item.location===oldName?{...item,location:v}:item);
                      persistAll(ni,counts,nl,categories,units,vendors);
                    }}
                  />
                </div>
                <button style={s.rowDel} onClick={()=>{
                  if(!confirm(`Delete "${loc.name}"?`))return;
                  persistAll(items,counts,locations.filter((_,j)=>j!==locations.indexOf(loc)),categories,units,vendors);
                }}>✕</button>
              </div>
            ))}
          </ListSection>

          {/* ── VENDORS ── */}
          <ListSection
            title="Vendors"
            onAdd={()=>persistAll(items,counts,locations,[...categories],units,[...vendors,"New Vendor"])}
          >
            {vendors.map((v,i)=>(
              <div key={i} style={s.listRow}>
                <InlineEdit value={v} width={200} onSave={nv=>{
                  const nw=vendors.map((x,j)=>j===i?nv:x);
                  persistAll(items,counts,locations,categories,units,nw);
                }}/>
                <button style={s.rowDel} onClick={()=>{
                  if(vendors.length<=1){alert("Must keep at least one vendor.");return;}
                  persistAll(items,counts,locations,categories,units,vendors.filter((_,j)=>j!==i));
                }}>✕</button>
              </div>
            ))}
          </ListSection>

          {/* ── CATEGORIES ── */}
          <ListSection
            title="Categories"
            onAdd={()=>persistAll(items,counts,locations,[...categories,"New Category"],units,vendors)}
          >
            {categories.map((c,i)=>(
              <div key={i} style={s.listRow}>
                <InlineEdit value={c} width={200} onSave={nv=>{
                  const nc=categories.map((x,j)=>j===i?nv:x);
                  persistAll(items,counts,locations,nc,units,vendors);
                }}/>
                <button style={s.rowDel} onClick={()=>{
                  if(categories.length<=1){alert("Must keep at least one category.");return;}
                  persistAll(items,counts,locations,categories.filter((_,j)=>j!==i),units,vendors);
                }}>✕</button>
              </div>
            ))}
          </ListSection>

          {/* ── UNITS ── */}
          <ListSection
            title="Units"
            onAdd={()=>persistAll(items,counts,locations,categories,[...units,"New Unit"],vendors)}
          >
            {units.map((u,i)=>(
              <div key={i} style={s.listRow}>
                <InlineEdit value={u} width={200} onSave={nv=>{
                  const nu=units.map((x,j)=>j===i?nv:x);
                  persistAll(items,counts,locations,categories,nu,vendors);
                }}/>
                <button style={s.rowDel} onClick={()=>{
                  if(units.length<=1){alert("Must keep at least one unit.");return;}
                  persistAll(items,counts,locations,categories,units.filter((_,j)=>j!==i),vendors);
                }}>✕</button>
              </div>
            ))}
          </ListSection>
        </div>
      )}
    </div>
  );
}

const s={
  app:{fontFamily:"system-ui,sans-serif",background:"#f7f5f0",minHeight:"100vh",maxWidth:720,margin:"0 auto",paddingBottom:100},
  header:{background:"#1a1a2e",color:"#fff",padding:"12px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:50},
  hL:{display:"flex",alignItems:"center",gap:10},hR:{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",justifyContent:"flex-end"},
  title:{fontSize:19,fontWeight:700},sub:{fontSize:10,opacity:0.6,marginTop:1},
  savedBadge:{background:"#22c55e",color:"#fff",borderRadius:12,padding:"2px 10px",fontSize:11,fontWeight:700},
  importBadge:{background:"#3b82f6",color:"#fff",borderRadius:12,padding:"2px 10px",fontSize:11,fontWeight:700},
  prog:{display:"flex",alignItems:"center",gap:6},
  progBar:{width:70,height:6,background:"rgba(255,255,255,0.2)",borderRadius:3,overflow:"hidden"},
  progFill:{height:"100%",background:"#22c55e",borderRadius:3,transition:"width 0.3s"},
  progLbl:{fontSize:12,opacity:0.75},
  nav:{display:"flex",background:"#fff",borderBottom:"1px solid #e5e7eb",position:"sticky",top:53,zIndex:40},
  navBtn:{flex:1,padding:"11px 4px",border:"none",background:"transparent",fontSize:13,fontWeight:500,cursor:"pointer",color:"#6b7280",borderBottom:"3px solid transparent"},
  navA:{color:"#1a1a2e",borderBottom:"3px solid #1a1a2e",fontWeight:700},
  content:{padding:"10px 10px 0"},
  toolbar:{display:"flex",flexDirection:"column",gap:7,marginBottom:10},
  fRow:{display:"flex",gap:7,flexWrap:"wrap",alignItems:"center"},
  search:{width:"100%",padding:"8px 12px",borderRadius:8,border:"1px solid #d1d5db",fontSize:16,boxSizing:"border-box"},
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
  mHeader:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8},
  importHint:{background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:8,padding:"8px 12px",fontSize:12,color:"#1e40af",marginBottom:10,textAlign:"left",lineHeight:1.6},
  addBtn:{background:"#1a1a2e",color:"#fff",border:"none",borderRadius:8,padding:"7px 12px",fontSize:12,fontWeight:600,cursor:"pointer"},
  xlsBtn:{background:"#16a34a",color:"#fff",border:"none",borderRadius:8,padding:"7px 12px",fontSize:12,fontWeight:600,cursor:"pointer"},
  importBtn:{background:"#2563eb",color:"#fff",border:"none",borderRadius:8,padding:"7px 12px",fontSize:12,fontWeight:600,cursor:"pointer"},
  mCard:{background:"#fff",borderRadius:10,padding:"10px 12px",border:"1px solid #e5e7eb",boxShadow:"0 1px 2px rgba(0,0,0,0.04)"},
  mTop:{display:"flex",alignItems:"center",gap:8,marginBottom:8},
  mFields:{display:"flex",flexWrap:"wrap",gap:10},
  fg:{display:"flex",flexDirection:"column",gap:2},
  fl:{fontSize:10,fontWeight:700,color:"#9ca3af",textTransform:"uppercase",letterSpacing:0.4},
  ef:{fontSize:13,color:"#111827",cursor:"pointer",borderBottom:"1px dashed #d1d5db",padding:"2px 0",minWidth:30,display:"inline-block"},
  inlineInput:{fontSize:16,padding:"2px 6px",border:"2px solid #3b82f6",borderRadius:6,outline:"none",fontFamily:"inherit"},
  otag:{background:"#e5e7eb",color:"#374151",borderRadius:6,padding:"2px 8px",fontSize:12,fontWeight:700,whiteSpace:"nowrap"},
  actBtn:{border:"none",borderRadius:8,padding:"4px 10px",fontSize:11,fontWeight:700,cursor:"pointer"},
  delBtn:{background:"#fef2f2",color:"#b91c1c",border:"1px solid #fecaca",borderRadius:7,padding:"4px 10px",fontSize:13,cursor:"pointer"},
  oPrompt:{textAlign:"center",padding:"60px 20px"},
  vendorHeader:{background:"#1a1a2e",color:"#fff",fontWeight:700,fontSize:12,letterSpacing:"0.5px",
    textTransform:"uppercase",padding:"7px 14px",borderRadius:"8px 8px 0 0",marginTop:4},
  poRow:{padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",
    background:"#fff",borderLeft:"1px solid #e5e7eb",borderRight:"1px solid #e5e7eb",
    borderBottom:"1px solid #e5e7eb"},
  listRow:{display:"flex",alignItems:"center",gap:8,background:"#fff",borderRadius:8,padding:"8px 10px",border:"1px solid #e5e7eb"},
  rowDel:{background:"#fef2f2",color:"#b91c1c",border:"1px solid #fecaca",borderRadius:6,padding:"3px 9px",fontSize:12,cursor:"pointer",flexShrink:0},
};
