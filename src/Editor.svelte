<script>
  // vim: ft=html
  import { onMount } from 'svelte';
  import { createEditor, Editor, EditorContent } from 'svelte-tiptap';
  import StarterKit from '@tiptap/starter-kit'
  import Highlight from '@tiptap/extension-highlight'
  import Typography from '@tiptap/extension-typography'
  import BubbleMenu from '@tiptap/extension-bubble-menu'
  import FloatingMenu from '@tiptap/extension-floating-menu'

  export let fullpage = false
  export let patch_id = ''
  export let markup = ''
  export let url = ''

  let editor

  let editorElement
  let bubbleMenuTemplate
  let floatingMenuTemplate
  let unsavedBanner

  onMount(() => {
    const bubbleMenuElement = bubbleMenuTemplate.content.firstElementChild
    const floatingMenuElement = floatingMenuTemplate.content.firstElementChild

    const bBold   = bubbleMenuElement.querySelector('[name="bold"]')
    const bItalic = bubbleMenuElement.querySelector('[name="italic"]')
    const bStrike = bubbleMenuElement.querySelector('[name="strike"]')
    const bUnder  = bubbleMenuElement.querySelector('[name="underline"]')
    const bH1   = floatingMenuElement.querySelector('[name="h1"]')
    const bH2   = floatingMenuElement.querySelector('[name="h2"]')
    const bUl   = floatingMenuElement.querySelector('[name="ul"]')
    const bPar  = floatingMenuElement.querySelector('[name="p"]')
    const bBq   = floatingMenuElement.querySelector('[name="bq"]')

    bBold.onclick   = () => { editor.chain().focus().toggleBold().run() }
    bItalic.onclick = () => { editor.chain().focus().toggleItalic().run() }
    bStrike.onclick = () => { editor.chain().focus().toggleStrike().run() }
    bUnder.onclick  = () => { editor.chain().focus().toggleUnderline().run() }
    bH1.onclick     = () => { editor.chain().focus().toggleHeading({ level: 1 }).run() }
    bH2.onclick     = () => { editor.chain().focus().toggleHeading({ level: 2 }).run() }
    bUl.onclick     = () => { editor.chain().focus().toggleBulletList().run() }
    bPar.onclick    = () => { editor.chain().focus().setParagraph().run() }
    bBq.onclick     = () => { editor.chain().focus().toggleBlockquote().run() }

    editor = createEditor({
      element: editorElement,
      content: (() => {
        const html = editorElement.innerHTML
        editorElement.innerHTML = ""
        return html
      })(),
      extensions: [
        StarterKit,
        Typography,
        // Disable bubble menu because disputatio is not able yet to handle inline
        // styling
        //BubbleMenu.configure({
        //  element: bubbleMenuElement,
        //}),
        FloatingMenu.configure({
          element: floatingMenuElement,
        }),
      ],
      onTransaction: () => {
        bBold.classList.toggle('is-active',   editor.isActive('bold'))
        bItalic.classList.toggle('is-active', editor.isActive('italic'))
        bStrike.classList.toggle('is-active', editor.isActive('strike'))
        bUnder.classList.toggle('is-active',  editor.isActive('underline'))
        bH1.classList.toggle('is-active',     editor.isActive('heading', { level: 1 }))
        bH2.classList.toggle('is-active',     editor.isActive('heading', { level: 2 }))
        bUl.classList.toggle('is-active',     editor.isActive('bulletList'))
        bPar.classList.toggle('is-active',    editor.isActive('paragraph'))
        bBq.classList.toggle('is-active',     editor.isActive('blockquote'))
      },
      onUpdate({ editor }) {
        unsavedBanner.style.display = 'block';
      },
    });
  });

  async function save(e) {
    e.preventDefault();
    const html = editor.getHTML();
    const form = new FormData()
    const spinner = e.target.parentElement.querySelector('.spinner')
    spinner.classList.toggle('invisible', false)
    try {
      form.append("html", html)
      form.append("parent_patch", editorElement.dataset.patchId)
      const url = editorElement.dataset.url
      const resp = await fetch(url || './', {method: 'POST', body: form})
      if (resp.status < 400) {
        unsavedBanner.style.display = 'none';
      } else {
        console.log(resp)
        let body = await resp.text()
        console.log(body)
        alert(resp.statusText)
      }
    } finally {
      spinner.classList.toggle('invisible', true)
    }
  }
</script>

<style>
.editor-container.fullpage .editor-unsaved {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
  margin: 0;
  background-color: var(--color-warn);
  padding: 0.5em;
}
.editor-menu button[name="bold"] { font-weight: bold }
.editor-menu button[name="italic"] { font-style: italic }
.editor-menu button[name="underline"] { text-decoration: underline }
.editor-menu button[name="strike"] { text-decoration: line-through }
body {
  /* Ensures that there is enough padding for the save banner */
  padding-bottom: 5rem;
}

.editor-container.embedded {
  display: flex;
  flex-flow: row nowrap;
  gap: 1rem;
}
.editor-container.embedded .html-editor[name="editor"] [contenteditable] {
  padding: 0.5rem;
  border: solid thin black;
  border-radius: 0.2rem;
}
.editor-container.embedded .editor-unsaved .unsaved-message {
  display: none;
}
.editor-container.embedded article.editor {
  flex: 1 1 auto;
}
.editor-container.embedded .editor-unsaved {
  flex: 0 0 auto;
  width: unset;
}
</style>

<div class="editor-container { fullpage ? "fullpage" : "embedded"}">
  <script>
    // https://github.com/atomiks/tippyjs/issues/990
    window.process = { env: { NODE_ENV: 'production' }}
  </script>
  <script type="module" src="/assets/editor.js"></script>
  <template name="editor-bubble-menu" bind:this={bubbleMenuTemplate}>
    <div class="editor editor-menu hmenu">
      <button name="bold">B</button>
      <button name="italic">I</button>
      <button name="underline">U</button>
      <button name="strike">S</button>
    </div>
  </template>
  <template name="editor-floating-menu" bind:this={floatingMenuTemplate}>
    <div class="editor editor-menu hmenu">
      <button name="h1">H1</button>
      <button name="h2">H2</button>
      <button name="ul"><svg fill="currentColor"><use xlink:href="/assets/bootstrap-icons.svg#list-ul"/></svg></button>
      <button name="p"><svg fill="currentColor"><use xlink:href="/assets/bootstrap-icons.svg#text-paragraph"/></svg></button>
      <button name="bq"><svg fill="currentColor"><use xlink:href="/assets/bootstrap-icons.svg#blockquote-left"/></svg></button>
    </div>
  </template>
  {#if fullpage}
    <nav>
      <ul>
        <li><a href="./">View</a></li>
      </ul>
    </nav>
  {/if}
  <article class="editor">
    <div class="html-editor"
         name="editor"
         data-patch-id={patch_id}
         bind:this={editorElement}
         data-url={url}>{@html markup}</div>
  </article>
  <p class="editor editor-unsaved" style="display: none" bind:this={unsavedBanner}>
    <span class="unsaved-message">You have unsaved changes</span>
    <button on:click={save}><span class="spinner invisible"></span>Enregistrer</button>
  </p>
</div>

