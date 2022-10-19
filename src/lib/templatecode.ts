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
  `
};
