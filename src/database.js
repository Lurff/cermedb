const BSON = require('bson');
const fs = require("node:fs")
const lodash = require("lodash");

class Database {
  constructor() {
    this.write = txt => fs.writeFile(this.file, txt, 'utf8', () => {});;
    this.file = "cerme.bson";
    try {
        this.database = BSON.deserialize(fs.readFileSync(this.file));
    } catch (e) {
        this.database = this.write("")
    }
  }

  math(key, value, sub = false) {
    if(value == null) throw new Error("İkinci bağımsız değişken 'value' eksik");
    if(typeof value != "number") throw new Error("İkinci bağımsız değişken 'sayı' türünde olmalıdır");
    let number = this.getItem(key);
    if(number == null) number = 0;
    if(typeof number != "number") throw new Error("First argument must be of type 'number'");
    sub ? number -= parseFloat(value) : number += parseFloat(value);
    this.setItem(key, number);
    return number;
  }

  setArray(value) {
    if(!Array.isArray(value)) return [value];
    else return value;
  }

  getItem(key) {
    if(key == null) throw new Error("Missing first argument (key)");
    if(typeof key != "string") throw new Error("First argument (key) needs to be a string");
    let row = lodash.get(this.database, key);
    return !row ? null : row;
  }

  getAll() {
    if(!this.database) return [];
    return this.database
  }

  includesItem(key) {
    if(key == null) throw new Error("Missing first argument (key)");
    if(typeof key != "string") throw new Error("First argument (key) needs to be a string");

    let exists = this.getAll().filter(x => x.ID.toLowerCase().includes(key.toLowerCase())).length !== 0
    return exists; 
  }

  setItem(key, value) {
    if(key == null) throw new Error("Missing first argument (key)");
    if(typeof key != "string") throw new Error("First argument (key) needs to be a string");
    if(value == null) throw new Error("Missing second argument (value)");

    lodash.set(this.database, key, value);
    this.write(BSON.serialize(this.database));
    return true;
  }

  deleteItem(key) {
    if(key == null) throw new Error("Missing first argument (key)");
    if(typeof key != "string") throw new Error("First argument (key) needs to be a string");
    lodash.unset(this.database, key);
    return true;
  }

  deleteValue(value) {
    if(value == null) throw new Error("Missing first argument (value)");

    this.getAll().filter(x => x.value === value).forEach(x => lodash.unset(this.database, x.ID));
    this.write(BSON.serialize(this.database));
    return true;
  }

  deleteAll() {
    this.database = {};
    this.write(BSON.serialize(this.database));
    return true;
  }

  hasItem(key) {
    if(key == null) throw new Error("Missing first argument (key)");
    const exists = this.getItem(key);
    return exists ? true : false;
  }

  pushItem(key, value) {
    if(key == null) throw new Error("Missing first argument (key)");
    if(typeof key != "string") throw new Error("First argument (key) needs to be a string");
    if(value == null) throw new Error("Missing second argument (value)");

    let arr = this.getItem(key) ?? [];
    arr = this.setArray(arr)
    if(Array.isArray(value)) arr = arr.concat(value);
    else arr.push(value);
    this.setItem(key, arr);
    return arr;
  }

  pullItem(key, value) {
    if(key == null) throw new Error("Missing first argument (key)");
    if(typeof key != "string") throw new Error("First argument (key) needs to be a string");
    if(value == null) throw new Error("Missing second argument (value)");
    let arr = this.getItem(key) ?? [];
    arr = arr.filter(x => {
     return Array.isArray(value) ? !value.includes(x) : JSON.stringify(x) !== JSON.stringify(value);
    });
    this.setItem(key, arr);
    return arr;
  }

  addItem(key, value) {
    if(key == null) throw new Error("Missing first argument (key)");
    if(typeof key != "string") throw new Error("First argument (key) needs to be a string");
    if(value == null) throw new Error("Missing second argument (value)");
    return this.math(key, value);
  }

  sub(key, value) {
    if(key == null) throw new Error("Missing first argument (key)");
    if(typeof key != "string") throw new Error("First argument (key) needs to be a string");
    if(value == null) throw new Error("Missing second argument (value)");
    return this.math(key, value, true);
  }

}

module.exports = new Database();
