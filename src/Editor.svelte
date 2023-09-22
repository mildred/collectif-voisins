<svelte:options accessors />
<script>
  // vim: ft=html
  import { onMount, createEventDispatcher } from 'svelte';
  import { createEditor, Editor, EditorContent } from 'svelte-tiptap';
  import StarterKit from '@tiptap/starter-kit'
  import Highlight from '@tiptap/extension-highlight'
  import Typography from '@tiptap/extension-typography'
  import BubbleMenu from '@tiptap/extension-bubble-menu'
  import FloatingMenu from '@tiptap/extension-floating-menu'
  import * as mdi from '@mdi/js';
  import SvgIcon from '@jamescoyle/svelte-icon';

  export let fullpage = false
  export let patch_id = ''
  export let markup = ''
  export let disabled = false

  export function clear() {
    markup = ''
    patch_id = ''
    disabled = false
  }

  let dispatch = createEventDispatcher()

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

    bBold.onclick   = () => { $editor.chain().focus().toggleBold().run() }
    bItalic.onclick = () => { $editor.chain().focus().toggleItalic().run() }
    bStrike.onclick = () => { $editor.chain().focus().toggleStrike().run() }
    bUnder.onclick  = () => { $editor.chain().focus().toggleUnderline().run() }
    bH1.onclick     = () => { $editor.chain().focus().toggleHeading({ level: 1 }).run() }
    bH2.onclick     = () => { $editor.chain().focus().toggleHeading({ level: 2 }).run() }
    bUl.onclick     = () => { $editor.chain().focus().toggleBulletList().run() }
    bPar.onclick    = () => { $editor.chain().focus().setParagraph().run() }
    bBq.onclick     = () => { $editor.chain().focus().toggleBlockquote().run() }

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
        bBold.classList.toggle('is-active',   $editor.isActive('bold'))
        bItalic.classList.toggle('is-active', $editor.isActive('italic'))
        bStrike.classList.toggle('is-active', $editor.isActive('strike'))
        bUnder.classList.toggle('is-active',  $editor.isActive('underline'))
        bH1.classList.toggle('is-active',     $editor.isActive('heading', { level: 1 }))
        bH2.classList.toggle('is-active',     $editor.isActive('heading', { level: 2 }))
        bUl.classList.toggle('is-active',     $editor.isActive('bulletList'))
        bPar.classList.toggle('is-active',    $editor.isActive('paragraph'))
        bBq.classList.toggle('is-active',     $editor.isActive('blockquote'))
      },
      onUpdate({ editor }) {
        unsavedBanner.style.display = 'block';
      },
      // Learn more: https://prosemirror.net/docs/ref/#view.EditorProps
      editorProps: {
        handleDOMEvents: {
          keydown: (view, event) => {
            if(event.key == 'Enter' && event.ctrlKey) {
              save(event)
            }
          }
        }
      },
    });
  });

  async function save(e) {
    if(e) e.preventDefault();
    dispatch('save', {
      html: $editor.getHTML(),
      parent_patch: editorElement.dataset.patchId,
    })
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
  background-color: var(--color-editor-unsaved);
  padding: 0.5em;
}
body {
  /* Ensures that there is enough padding for the save banner */
  padding-bottom: 5rem;
}

.editor-container.embedded {
  display: flex;
  flex-flow: row nowrap;
  gap: 1rem;
  align-items: end;
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
.editor-menu button {
  margin: 0;
  padding: 0;
}
</style>

<div class="editor-container { fullpage ? "fullpage" : "embedded"}">
  <template name="editor-bubble-menu" bind:this={bubbleMenuTemplate}>
    <div class="editor editor-menu hmenu">
      <button name="bold"><SvgIcon type='mdi' path={mdi.mdiFormatBold} /></button>
      <button name="italic"><SvgIcon type='mdi' path={mdi.mdiFormatItalic} /></button>
      <button name="underline"><SvgIcon type='mdi' path={mdi.mdiFormatUnderline} /></button>
      <button name="strike"><SvgIcon type='mdi' path={mdi.mdiFormatStrikethrough} /></button>
    </div>
  </template>
  <template name="editor-floating-menu" bind:this={floatingMenuTemplate}>
    <div class="editor editor-menu hmenu">
      <button name="h1"><SvgIcon type='mdi' path={mdi.mdiFormatHeader1} /></button>
      <button name="h2"><SvgIcon type='mdi' path={mdi.mdiFormatHeader2} /></button>
      <button name="ul"><SvgIcon type='mdi' path={mdi.mdiFormatListBulleted} /></button>
      <button name="p"><SvgIcon type='mdi' path={mdi.mdiFormatParagraph} /></button>
      <button name="bq"><SvgIcon type='mdi' path={mdi.mdiFormatQuoteOpen} /></button>
    </div>
  </template>
  <article class="editor">
    <div class="html-editor"
         name="editor"
         data-patch-id={patch_id}
         bind:this={editorElement}>{@html markup}</div>
  </article>
  <p class="editor editor-unsaved" style="display: none" bind:this={unsavedBanner}>
    <span class="unsaved-message">Vos nodifications n'ont pas été enregistrées</span>
    <button on:click={save} disabled={disabled}><span class="spinner invisible"></span>
      {#if fullpage}
        Enregistrer
      {:else}
        <SvgIcon type='mdi' path={mdi.mdiSend} />
      {/if}
    </button>
  </p>
</div>

