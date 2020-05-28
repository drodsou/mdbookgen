import {slashJoin} from 'https://raw.githubusercontent.com/drodsou/denolib/master/ts/slash_join/mod.ts';


import getMdParts from '/users/drodsou/git/denolib/ts/markdown2/get_md_parts.ts';

import {timeToRead} from 'https://raw.githubusercontent.com/drodsou/denolib/master/ts/time_to_read/mod.ts';

import marked from 'https://unpkg.com/marked@1.0.0/lib/marked.esm.js';


import {curlyTransformRef} from '/users/drodsou/git/denolib/ts/curly_template/curly_transform_ref.ts';
import {curlyTransformProp} from '/users/drodsou/git/denolib/ts/curly_template/curly_transform_prop.ts';
import {curlyTransformInclude} from '/users/drodsou/git/denolib/ts/curly_template/curly_transform_include.ts';
import {curlyTransformRun} from '/users/drodsou/git/denolib/ts/curly_template/curly_transform_run.ts';

import {watch} from '/users/drodsou/git/denolib/ts/watch_throttled/mod.ts';


/** build all chapter folders concatenating everything in one file and saving as index.html */
async function buildBook (bookFolder='', props:any={}, chapters:string[]=[]) {

  bookFolder = bookFolder || slashJoin(Deno.cwd(), 'chapters');
  let layoutMod = await import('file://' + Deno.cwd() + '/public/theme/layout.js' + '?' + Math.random());
  let layout = layoutMod.default;

  let bookContent = '';

  if (!chapters.length) {
    chapters = [...Deno.readDirSync(bookFolder)]
      .filter(e=>e.isDirectory)
      .map(e=>e.name);
  }

  for (let chapter of chapters) {
    
    bookContent += '# ' + chapter.split('#')[1].replace(/_/g,' ') + '\n\n';

    bookContent += await buildChapter( slashJoin(bookFolder, chapter), props);
  }

  let markedSlugger = new marked.Slugger();
  let tableOfContents = bookContent
    .split('\n')
    .filter(e=>e.startsWith('#'))
    .map(e=>{
      let eText = e.replace(/#+ /,'');
      let eAnchor = markedSlugger.slug(eText);
      let eLink = `<a href="#${eAnchor}">${eText}</a>`
      let eIndentation = ' '.repeat( (e.split('#').length -2) * 2);
      return eIndentation + '- ' + eLink;
    })
    .join('\n');

  let htmlTOC = marked(tableOfContents, null, null);

  
  let disclaimer = `<!-- 
  Automatically generated from /public/theme/layout.js 
  Any edition to this file will be lost y next rebuild
  -->\n`;

  let htmlContent = disclaimer + layout({htmlTOC}, marked(bookContent, null, null));
  Deno.writeTextFileSync(Deno.cwd() + '/public/index.html', htmlContent);
}


/** build a chapter folder concatenating all .md files there */
async function buildChapter (chapterFolder:string, props:any={}) {

  let files = [...Deno.readDirSync(chapterFolder)]
    .filter(e=>e.name.endsWith('.md'))
    .map(e=>e.name);
    
  // -- join of files of folder, expecte to be of format 00#The_title.md
  let allMdContent = '';
  let allProps:any = {...props};
  for (let file of files) {
    let mdTitle = '## ' + file.split('#')[1].replace('.md','').replace(/_/g,' ');

    //console.log('file', file);
    let mdParts = getMdParts(Deno.readTextFileSync(chapterFolder + '/' + file));

    let mdContent = mdParts.content;

    allProps = {...allProps, ...mdParts.frontmatter}    
  
    // -- process variables
    mdContent = curlyTransformRef(mdContent, file, allProps).text;
    mdContent = curlyTransformProp(mdContent, file, allProps).text;
    mdContent = curlyTransformInclude(mdContent, file).text;
    mdContent = (await curlyTransformRun(mdContent, file, allProps)).text;
    
    allMdContent += '\n\n' + mdTitle + '\n\n' + mdParts.content;

  };

  return allMdContent;

}



// -- cli main
if (import.meta.main) {
  await buildBook(Deno.args[0], Deno.args[1]);
  watch({dirs:['.'], exclude:['public/index.html'], fn: async (dirs:any)=>{
    await buildBook(Deno.args[0], Deno.args[1]);
  }});
  console.log(`Watching ${Deno.cwd()}`);
}


