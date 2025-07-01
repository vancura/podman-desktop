"use strict";
(self["webpackChunkdocs"] = self["webpackChunkdocs"] || []).push([[35858],{

/***/ 26591:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_docs_minikube_installing_extension_md_4bf_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/default/site-docs-minikube-installing-extension-md-4bf.json
const site_docs_minikube_installing_extension_md_4bf_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"minikube/installing-extension","title":"Installing the Minikube extension","description":"Tutorial on how to install the Minikube extension and use it","source":"@site/docs/minikube/installing-extension.md","sourceDirName":"minikube","slug":"/minikube/installing-extension","permalink":"/docs/minikube/installing-extension","draft":false,"unlisted":false,"editUrl":"https://github.com/podman-desktop/podman-desktop/tree/main/website/docs/minikube/installing-extension.md","tags":[{"inline":true,"label":"podman","permalink":"/docs/tags/podman"},{"inline":true,"label":"kubernetes","permalink":"/docs/tags/kubernetes"},{"inline":true,"label":"minikube","permalink":"/docs/tags/minikube"}],"version":"current","sidebarPosition":1,"frontMatter":{"sidebar_position":1,"title":"Installing the Minikube extension","description":"Tutorial on how to install the Minikube extension and use it","keywords":["podman desktop","podman","minikube","kubernetes"],"tags":["podman","kubernetes","minikube"]},"sidebar":"mySidebar","previous":{"title":"Minikube","permalink":"/docs/minikube/"},"next":{"title":"Installing the CLI","permalink":"/docs/minikube/installing"}}');
// EXTERNAL MODULE: ../node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(62540);
// EXTERNAL MODULE: ../node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(43023);
// EXTERNAL MODULE: ../node_modules/react-player/lib/index.js
var react_player_lib = __webpack_require__(64566);
var lib_default = /*#__PURE__*/__webpack_require__.n(react_player_lib);
;// ./docs/minikube/installing-extension.md


const frontMatter = {
	sidebar_position: 1,
	title: 'Installing the Minikube extension',
	description: 'Tutorial on how to install the Minikube extension and use it',
	keywords: [
		'podman desktop',
		'podman',
		'minikube',
		'kubernetes'
	],
	tags: [
		'podman',
		'kubernetes',
		'minikube'
	]
};
const contentTitle = 'Installing the Minikube extension';

const assets = {

};




const toc = [{
  "value": "Procedure",
  "id": "procedure",
  "level": 4
}, {
  "value": "Tutorial",
  "id": "tutorial",
  "level": 4
}];
function _createMdxContent(props) {
  const _components = {
    a: "a",
    h1: "h1",
    h4: "h4",
    header: "header",
    p: "p",
    strong: "strong",
    ...(0,lib/* useMDXComponents */.R)(),
    ...props.components
  };
  return (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
    children: [(0,jsx_runtime.jsx)(_components.header, {
      children: (0,jsx_runtime.jsx)(_components.h1, {
        id: "installing-the-minikube-extension",
        children: "Installing the Minikube extension"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The Minikube extension provides the capability of creating a local Kubernetes cluster. This extension can be installed and used as a one-click deployment for a test cluster."
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "procedure",
      children: "Procedure"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["If you have Podman Desktop already installed, ", (0,jsx_runtime.jsx)("a", {
        href: "podman-desktop:extension/podman-desktop.minikube",
        children: (0,jsx_runtime.jsx)(_components.strong, {
          children: "click to launch the installation"
        })
      }), " of Minikube in Podman Desktop."]
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: ["If not, please ", (0,jsx_runtime.jsx)(_components.a, {
        href: "/docs/installation",
        children: "install Podman Desktop"
      }), " first."]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "tutorial",
      children: "Tutorial"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The following video provides a complete guide from installation to cluster creation:"
    }), "\n", (0,jsx_runtime.jsx)((lib_default()), {
      playing: true,
      playsinline: true,
      controls: true,
      url: "https://github.com/containers/podman-desktop-media/raw/refs/heads/minikube/video/guide.mp4",
      width: "100%",
      height: "100%"
    })]
  });
}
function MDXContent(props = {}) {
  const {wrapper: MDXLayout} = {
    ...(0,lib/* useMDXComponents */.R)(),
    ...props.components
  };
  return MDXLayout ? (0,jsx_runtime.jsx)(MDXLayout, {
    ...props,
    children: (0,jsx_runtime.jsx)(_createMdxContent, {
      ...props
    })
  }) : _createMdxContent(props);
}



/***/ })

}]);