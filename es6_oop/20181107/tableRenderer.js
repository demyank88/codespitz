
const Data = class {
  async getData(){
    const data = await this._getData();
    return new Info(data);
  }
  async _getData(){throw 'getData must override';}
};

const Info = class {
  constructor(json){
    const {title, header, items} = json;
    if(typeof title != 'string' || !title) throw 'invalid title';
    if(!Array.isArray(header) || !header.length) throw 'invalid header';
    if(!Array.isArray(items) || !items.length) throw 'invalid items';
    this._private = {title, header, items};
  }
  get title(){return this._private.title;}
  get header(){return this._private.header;}
  get items(){return this._private.items;}
}

const JsonData = class extends Data {
  constructor(data){
    super();
    this._data = data;
  }
  async _getData(){
    let json;
    if(typeof this._data == 'string') {
      const response = await fetch(this._data);
      json = await response.json();
    } else json = this._data;
    return new Info(json);
  }
};

const Renderer = class {
  constructor(data){
    if(!(data instanceof Data)) throw 'invalid data type';
    this.data = data;
  }
  async render () {
    const res = await this.data.getData();
    this._info = res._private;
    this._render();
  }
  _render(){
    throw '_render must overrided';
  }
};

const TableRenderer = class extends Renderer {
  constructor(parent, data){
    super(data);
    if(typeof parent != 'string' || !parent) throw 'invalid param';
    this._parent = parent;
    this.render();
  }
  _render(){
    const parent = document.querySelector(this._parent);
    if(!parent) throw 'invalid parent';
    parent.innerHTML = '';
    const {title, header, items} = this._info;
    const [table, caption, thead] = 'table,caption,thead'.split(',').map(v=>document.createElement(v));
    caption.innerHTML = title;
    [
      caption,
      header.reduce((_, v) => (thead.appendChild(document.createElement('th')).innerHTML = v, thead)),
      ...items.map(item => item.reduce(
        (tr, v) => (tr.appendChild(document.createElement('td')).innerHTML = v, tr),
        document.createElement('tr')
      ))
    ].forEach(el => table.appendChild(el));
    parent.appendChild(table);
  }
};


const test = new JsonData('data.json');

new TableRenderer('.container', test);
