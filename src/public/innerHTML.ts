export const bugInnerHtml = `
  <div class="flex flex-col items-center justify-center border-b-2 border-r border-white/10 p-4">
    <div  class="w-16 h-10 rounded-4xl transition-transform duration-300 ease-in-out hover:scale-x-[0.75] status-label">
    </div>
    <div>
      <h4 class="text-sm text-white/40 font-semibold tracking-wide mt-2 status-text">In-progress</h4>
    </div>
  </div>

  <div class="flex border-b-2 border-white/10 p-4 items-center min-w-0">
    <h1 class="text-2xl text-white/40 font-semibold tracking-wide truncate title">
      Time Limit Exceeded
    </h1>
  </div>

  <div class="flex col-span-2 p-4 border-b-2 border-white/0 items-center">
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 32 32" 
      class="w-5 h-5 text-white/40" 
      fill="currentColor"
    >
      <path d="M16 14c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zm0-12c-2.757 0-5 2.243-5 5s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5zM27 32a1 1 0 0 1-1-1v-6.115a6.95 6.95 0 0 0-6.942-6.943h-6.116A6.95 6.95 0 0 0 6 24.885V31a1 1 0 1 1-2 0v-6.115c0-4.93 4.012-8.943 8.942-8.943h6.116c4.93 0 8.942 4.012 8.942 8.943V31a1 1 0 0 1-1 1z"/>
    </svg>
    <h4 class="text-sm text-white/40 font-semibold tracking-wide ml-2 underline underline-offset-2 author">name</h4>
  </div>

  <div class="col-span-2 border-b-0 border-white/10 min-w-0">
    <h4 class="text-sm text-white/50 font-light tracking-wide px-4 line-clamp-5 whitespace-normal bug-text">
    </h4>
  </div>

  <div class="flex col-span-2 items-center justify-end">
    <div class="flex items-center mr-4 close-bug-div">
      <button class="flex items-center justify-center border border-white/10 w-28 h-7 rounded-xl cursor-pointer transition-colors duration-300 ease-in-out hover:bg-white/5 close-bug">
        <h4 class="text-sm text-white/40 font-semibold tracking-wide mr-1">
          Close bug
        </h4>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          class="w-4 h-4 text-white/40 transition-colors duration-300 group-hover:text-white/70" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    <div class="flex">
      <button class="comments">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 32 32" 
          class="w-6 h-6 text-white/40 cursor-pointer transition-colors duration-300 ease-in-out hover:text-white/70" 
          fill="currentColor"
        >
          <path d="M26.35 6H5.65A3.66 3.66 0 0 0 2 9.65v12.7A3.66 3.66 0 0 0 5.65 26h20.7A3.66 3.66 0 0 0 30 22.35V9.65A3.66 3.66 0 0 0 26.35 6zM28 22.35A1.65 1.65 0 0 1 26.35 24H5.65A1.65 1.65 0 0 1 4 22.35V9.65A1.65 1.65 0 0 1 5.65 8h20.7A1.65 1.65 0 0 1 28 9.65z"/><path d="M25.49 9.14 16 14.83 6.51 9.14a1 1 0 1 0-1 1.72l10 6a1 1 0 0 0 1 0l10-6a1 1 0 0 0-1-1.72z"/>
        </svg>
      </button>
    </div>
    <div class="flex mr-4 ml-2">
      <h4 class="text-sm text-white/40 font-semibold tracking-wide comments-count">3</h4>
    </div>
  </div>
`;

export const commentSectionInnerHtml = `
  <div class="flex p-4 border-b border-white/10 items-center justify-between ">
    <div class="flex min-w-0 flex-1 items-center">
      <h3 class="text-sm text-white/40 font-semibold tracking-wide shrink-0">
        Comments
      </h3>
      <span class="text-sm text-white/40 font-semibold mx-2">•</span>
      <h3 id="comment-section-bug-title" class="text-sm text-white/40 font-semibold tracking-wide truncate">
        
      </h3>
    </div>

    <div class="flex items-center ml-4">
      <button id="close-comment-section" class="flex items-center justify-center border border-white/10 w-7 h-7 rounded-xl cursor-pointer transition-colors duration-300 ease-in-out hover:bg-white/5">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          class="w-4 h-4 text-white/40 transition-colors duration-300 group-hover:text-white/70" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>

  <div id="comment-block" class="flex-1 overflow-y-auto p-4 space-y-4">
  </div>
`;

export const inputDivInnerHtml = `
  <input 
    id="input-comment"
    type="text" 
    placeholder="Add a comment..." 
    class="w-full rounded-xl border border-white/10 bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/30 focus:ring-1 focus:ring-white/10 transition-all"
  />
  <button id="upload-comment" type="button" class="flex items-center justify-center border border-white/10 w-16 rounded-xl ml-2 cursor-pointer transition-colors duration-300 ease-in-out hover:bg-white/5">
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 1792 1792" 
      class="w-4 h-4 text-white/40 cursor-pointer transition-colors duration-300 ease-in-out hover:text-white/70" 
      fill="currentColor"
    >
      <path d="M1764 11q33 24 27 64l-256 1536q-5 29-32 45-14 8-31 8-11 0-24-5l-453-185-242 295q-18 23-49 23-13 0-22-4-19-7-30.5-23.5t-11.5-36.5v-349l864-1059-1069 925-395-162q-37-14-40-55-2-40 32-59l1664-960q15-9 32-9 20 0 36 11z"/>
    </svg>
  </button>
`;