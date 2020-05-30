import {slashJoin} from 'https://raw.githubusercontent.com/drodsou/denolib/master/ts/slash_join/mod.ts';

import getMdParts from 'https://raw.githubusercontent.com/drodsou/denolib/master/ts/markdown2/get_md_parts.ts';

import {timeToRead} from 'https://raw.githubusercontent.com/drodsou/denolib/master/ts/time_to_read/mod.ts';

import marked from 'https://unpkg.com/marked@1.0.0/lib/marked.esm.js';


import {curlyTransformRef} from 'https://raw.githubusercontent.com/drodsou/denolib/master/ts/curly_template/curly_transform_ref.ts';
import {curlyTransformProp} from 'https://raw.githubusercontent.com/drodsou/denolib/master/ts/curly_template/curly_transform_prop.ts';
import {curlyTransformInclude} from 'https://raw.githubusercontent.com/drodsou/denolib/master/ts/curly_template/curly_transform_include.ts';
// import {curlyTransformRun} from 'https://raw.githubusercontent.com/drodsou/denolib/master/ts/curly_template/curly_transform_run.ts';
import {curlyTransformRun} from '../denolib/ts/curly_template/curly_transform_run.ts';

import {watch} from 'https://raw.githubusercontent.com/drodsou/denolib/master/ts/watch_throttled/mod.ts';

import {unzipRemote} from 'https://raw.githubusercontent.com/drodsou/denolib/master/ts/unzip_remote/unzip_remote.ts';

import {VERSION} from './version.ts';

/** 
 * build all chapter folders concatenating everything in one file and saving as index.html 
 * */
async function buildBook (bookFolder='', props:any={}, chapters:string[]=[]) {

  bookFolder = bookFolder ? slashJoin (bookFolder) : slashJoin(Deno.cwd());
  let chaptersFolder = slashJoin(bookFolder, '/chapters');
  let layoutMod = await import('file://' + Deno.cwd() + '/public/theme/layout.js' + '?' + Math.random());
  let layout = layoutMod.default;

  let bookContent = '';

  if (!chapters.length) {
    chapters = [...Deno.readDirSync(chaptersFolder)]
      .filter(e=>e.isDirectory)
      .map(e=>e.name);
  }

  for (let chapter of chapters) {
    bookContent += '# ' + chapter.split('.')[1].replace(/_/g,' ') + '\n\n';

    bookContent += await buildChapter( slashJoin(chaptersFolder, chapter), props);
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
    let mdTitle = '## ' + file.split('.')[1].replace('.md','').replace(/_/g,' ');

    let fileAbs = chapterFolder + '/' + file;

    //console.log('file', file);
    let mdParts = getMdParts(Deno.readTextFileSync(fileAbs));

    let mdContent = mdParts.content;

    allProps = {...allProps, ...mdParts.frontmatter}    
  
    // -- process variables
    // try {
      mdContent = curlyTransformRef(mdContent, fileAbs, allProps).text;
      mdContent = curlyTransformProp(mdContent, fileAbs, allProps).text;
      mdContent = curlyTransformInclude(mdContent, fileAbs).text;
      mdContent = (await curlyTransformRun(mdContent, fileAbs, allProps)).text;
    // } catch (e) {
    //   console.log('\n----- CURLY TRANSFORM ERROR -----');
    //   console.log(e);
    // }
    
    allMdContent += '\n\n' + mdTitle + '\n\n' + mdContent;

  };

  return allMdContent;

}

export async function getProps (bookFolder:string) {
  let props:any;
  let propsFile = 'file://' + bookFolder + '/doc/props.js'  + '?' + Math.random();
  let propsFileExists = (await Deno.stat(propsFile).catch(e=>e)).isFile;
  if (propsFileExists) {
    props = { props: {refs:{}} };
    console.log(`INFO: props.js not found in ${bookFolder}/doc.`);
  } else {
    let propsMod = await import(propsFile)
    props = propsMod.props
  }
  return props;
}



// --- CLI MAIN
if (import.meta.main) {

  // -- init?
  if (Deno.args[0] === 'init') {
    await unzipRemote(
      `https://github.com/drodsou/mdbookgen/archive/${VERSION}.zip`, 
      Deno.cwd(), 
      `mdbookgen-${VERSION.slice(1)}/example-book`
    );
    console.log(`
      Done. Now you can:
      - open vscode (code .) 
      - open public/index.html with live server extension
      - run 'mdbookgen' to watch your changes in realtime
    `);
    Deno.exit(0);
  }

  // -- build
  let bookFolder = Deno.args[0] || slashJoin(Deno.cwd());
  let props = await getProps(bookFolder);
  console.log(`Props loaded from ${bookFolder}/doc/props.js`);
  await buildBook(bookFolder, props);

  watch({dirs:['.'], exclude:['public/index.html'], fn: async (dirs:any)=>{
    props = await getProps(bookFolder);
    await buildBook(bookFolder, props);
    console.log('Book compiled');
  }});
  console.log(`Watching ${Deno.cwd()}`);
}


