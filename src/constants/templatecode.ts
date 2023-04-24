export const templatecode = {
  'module.ts': `export function fib(n: i32): i32 {
    var a = 0, b = 1
    if (n > 0) {
      while (--n) {
        let t = a + b
        a = b
        b = t
      }
      return b
    }
    return a
  }
  `,
  'index.html': `<textarea id="output" style="height: 100%; width: 100%" readonly></textarea>
  <script type="module">
  const exports = await instantiate(await compile(), { /* imports */ })
  const output = document.getElementById('output')
  for (let i = 0; i <= 10; ++i) {
    output.value += \`fib(\${i}) = \${exports.fib(i)}\n\`
  }
  </script>
  `,
  'interferenceExample.ts': `var width  = 320;
  var height = 200;
  
  // Let's utilize the entire heap as our image buffer
  export const offset = __heap_base;
  
  /** Sets a single pixel's color. */
  function set(x: i32, y: i32, v: f32): void {
    var vi = <i32>v;
    store<i32>(offset + ((width * y + x) << 2), ~vi << 24 | vi << 8);
  }
  
  /** Computes the distance between two pixels. */
  function distance(x1: i32, y1: i32, x2: f32, y2: f32): f32 {
    var dx = <f32>x1 - x2;
    var dy = <f32>y1 - y2;
    return Mathf.sqrt(dx * dx + dy * dy);
  }
  
  /** Performs one tick. */
  export function update(tick: f32): void {
    var w = <f32>width;
    var h = <f32>height;
    var hw = w * 0.5,
        hh = h * 0.5;
    var cx1 = (Mathf.sin(tick * 2) + Mathf.sin(tick      )) * hw * 0.3 + hw,
        cy1 = (Mathf.cos(tick)                            ) * hh * 0.3 + hh,
        cx2 = (Mathf.sin(tick * 4) + Mathf.sin(tick + 1.2)) * hw * 0.3 + hw,
        cy2 = (Mathf.sin(tick * 3) + Mathf.cos(tick + 0.1)) * hh * 0.3 + hh;
    var res = <f32>48 / Mathf.max(w, h);
    var y = 0;
    do {
      let x = 0;
      do {
        set(x, y, Mathf.abs(
          Mathf.sin(distance(x, y, cx1, cy1) * res) +
          Mathf.sin(distance(x, y, cx2, cy2) * res)
        ) * 120);
      } while (++x != width)
    } while (++y != height)
  }
  
  /** Recomputes and potentially grows memory on resize of the viewport. */
  export function resize(w: i32, h: i32): void {
    width = w; height = h;
    // Pages are 64kb. Rounds up using mask 0xffff before shifting to pages.
    var needed = <i32>((offset + (w * h * sizeof<i32>() + 0xffff)) & ~0xffff) >>> 16;
    var actual = memory.size();
    if (needed > actual) memory.grow(needed - actual);
  }
  `,
  'interferenceExample.html': `<canvas id="canvas" style="width: 100%; height: 100%; background: #aff"></canvas>
  <script type="module">
  const exports = await instantiate(await compile());
  const canvas = document.getElementById("canvas");
  const context = canvas.getContext("2d");
  const step = 0.012;
  
  // Upscale the image to speed up calculations
  const upscaleFactor = 4;
  
  var width, height, image;
  
  // Inform the module about the viewport's size, incl. on resize
  function onresize() {
    width = (canvas.offsetWidth / upscaleFactor) | 0;
    height = (canvas.offsetHeight / upscaleFactor) | 0;
    canvas.width = width;
    canvas.height = height;
    image = context.createImageData(width, height);
    exports.resize(width, height);
  }
  onresize();
  new ResizeObserver(onresize).observe(canvas);
  
  // Keep updating the image
  var tick = 0.0;
  (function update() {
    requestAnimationFrame(update);
    exports.update(tick += step);
    new Uint32Array(image.data.buffer).set(new Uint32Array(exports.memory.buffer, exports.offset.value, width * height));
    context.putImageData(image, 0, 0);
  })();
  </script>
  `,
  'json.ts': `
//sdk docs:https://github.com/machinefi/w3bstream-wasm-ts-sdk
export function start(rid: i32): i32 {
  Log(rid.toString());
  const message = GetDataByRID(rid);
  Log(message);
  let jsonObj: JSON.Obj = JSON.parse(
     message
  ) as JSON.Obj;
  let employeesOrNull: JSON.Obj | null = jsonObj.getObj("employees");
  if (employeesOrNull != null) {
        let employees: JSON.Obj = employeesOrNull;
        let employeeOrNull: JSON.Arr | null = employees.getArr("employee");
        if (employeeOrNull != null) {
            let employee: JSON.Arr = employeeOrNull;
            let valueOfArray: JSON.Value[] = employee.valueOf();
            for (let i = 0; i < valueOfArray.length; i++) {
                let value: JSON.Value = valueOfArray[i];
                let employeeObj: JSON.Obj = value as JSON.Obj;
                let firstNameOrNull: JSON.Str | null =
                    employeeObj.getString("firstName");
                if (firstNameOrNull != null) {
                    let firstName: string = firstNameOrNull.valueOf();
                    Log("firstName:" + firstName);
                }
                let lastNameOrNull: JSON.Str | null = employeeObj.getString("lastName");
                if (lastNameOrNull != null) {
                    let lastName: string = lastNameOrNull.valueOf();
                    Log("lastName:" + lastName);
                }
                let photoOrNull: JSON.Str | null = employeeObj.getString("photo");
                if (photoOrNull != null) {
                    let photo: string = photoOrNull.valueOf();
                    Log("photo:" + photo);
                }
            }
        }
    }
  return 0;
}
  `,
  'log.ts': `
  //sdk docs:https://github.com/machinefi/w3bstream-wasm-ts-sdk
  export function start(rid: i32): i32 {
    Log("start from typescript");
    const message = GetDataByRID(rid);
    Log("wasm received message:" + message);
    return 0;
  }
  `,
  'sendTx.ts': `
//sdk docs:https://github.com/machinefi/w3bstream-wasm-ts-sdk
export function start(rid: i32): i32 {
  Log("Log:start from typescript123");
  SendTx(
      4690,
      "0x4BF7916893DfA78834B2F8B535654682d36e1163",
      "0",
      \`6a627842000000000000000000000000${'0x9117f5EF4156709092f79740a97b1638cA399A00'.replace('0x', '')}\`
    );
  // const message = GetDataByRID(rid);
  return rid;
}
`,
  'setDB.ts': `
  //sdk docs:https://github.com/machinefi/w3bstream-wasm-ts-sdk
   export function start(rid: i32): i32 {
     Log("Log:start from typescript123");
     SetDB("count",1);
     const count = GetDB("count");
     if(count){
        Log("count:"+count.toString());
     }
     return rid;
   }
  `,
  'sql.ts':`
  export function start(rid: i32): i32 {
    const value = ExecSQL(\`INSERT INTO "t_log" (number,text,boolean) VALUES (?,?,?);\`, [new SQL.Int32(1), new SQL.String("test"),new SQL.Bool(false)]);
    const res = QuerySQL(\`SELECT * FROM "t_log";\`);
    return rid;
  }
  `
};
