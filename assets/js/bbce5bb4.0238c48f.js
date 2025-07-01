"use strict";
(self["webpackChunkdocs"] = self["webpackChunkdocs"] || []).push([[85096],{

/***/ 62041:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_docs_kind_installing_extension_md_bbc_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/default/site-docs-kind-installing-extension-md-bbc.json
const site_docs_kind_installing_extension_md_bbc_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"kind/installing-extension","title":"Installing the Kind extension","description":"Tutorial on how to install the Kind extension and use it","source":"@site/docs/kind/installing-extension.md","sourceDirName":"kind","slug":"/kind/installing-extension","permalink":"/docs/kind/installing-extension","draft":false,"unlisted":false,"editUrl":"https://github.com/podman-desktop/podman-desktop/tree/main/website/docs/kind/installing-extension.md","tags":[{"inline":true,"label":"podman","permalink":"/docs/tags/podman"},{"inline":true,"label":"kubernetes","permalink":"/docs/tags/kubernetes"},{"inline":true,"label":"kind","permalink":"/docs/tags/kind"}],"version":"current","sidebarPosition":1,"frontMatter":{"sidebar_position":1,"title":"Installing the Kind extension","description":"Tutorial on how to install the Kind extension and use it","keywords":["podman desktop","podman","kind","kubernetes"],"tags":["podman","kubernetes","kind"]},"sidebar":"mySidebar","previous":{"title":"Kind","permalink":"/docs/kind/"},"next":{"title":"Installing the CLI","permalink":"/docs/kind/installing"}}');
// EXTERNAL MODULE: ../node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(62540);
// EXTERNAL MODULE: ../node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(43023);
// EXTERNAL MODULE: ../node_modules/react-player/lib/index.js
var react_player_lib = __webpack_require__(64566);
var lib_default = /*#__PURE__*/__webpack_require__.n(react_player_lib);
;// ./docs/kind/installing-extension.md


const frontMatter = {
	sidebar_position: 1,
	title: 'Installing the Kind extension',
	description: 'Tutorial on how to install the Kind extension and use it',
	keywords: [
		'podman desktop',
		'podman',
		'kind',
		'kubernetes'
	],
	tags: [
		'podman',
		'kubernetes',
		'kind'
	]
};
const contentTitle = 'Installing the Kind extension';

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
    admonition: "admonition",
    code: "code",
    em: "em",
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
        id: "installing-the-kind-extension",
        children: "Installing the Kind extension"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.admonition, {
      type: "note",
      children: (0,jsx_runtime.jsxs)(_components.p, {
        children: ["Kind is a ", (0,jsx_runtime.jsx)(_components.em, {
          children: "built-in"
        }), " extension to Podman Desktop and no installation is necessary."]
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The Kind extension provides the capability of creating a local Kubernetes cluster using only containers rather than a Virtual Machine."
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "procedure",
      children: "Procedure"
    }), "\n", (0,jsx_runtime.jsxs)(_components.p, {
      children: [(0,jsx_runtime.jsx)(_components.a, {
        href: "/docs/installation",
        children: "Install Podman Desktop"
      }), " to have the extension available. To confirm the built-in extension is installed, you can find Kind within the ", (0,jsx_runtime.jsx)(_components.strong, {
        children: "Extensions"
      }), " section of Podman Desktop."]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "tutorial",
      children: "Tutorial"
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "The following video provides a complete guide on creating a single-node cluster:"
    }), "\n", (0,jsx_runtime.jsx)((lib_default()), {
      playing: true,
      playsinline: true,
      controls: true,
      url: "https://github.com/containers/podman-desktop-media/raw/refs/heads/kind/video/cluster-creation-kind.mp4",
      width: "100%",
      height: "100%"
    }), "\n", (0,jsx_runtime.jsx)(_components.admonition, {
      type: "note",
      children: (0,jsx_runtime.jsxs)(_components.p, {
        children: ["If you are running Podman Desktop in a Linux system host and enabling the Contour ingress controller, you need to ensure that the ", (0,jsx_runtime.jsx)(_components.code, {
          children: "ip_tables"
        }), " module is loaded, otherwise the ", (0,jsx_runtime.jsx)(_components.code, {
          children: "envoy"
        }), " pod will fail to insert an iptable rule that it needs in order to be deployed (", (0,jsx_runtime.jsx)(_components.code, {
          children: "/usr/sbin/iptables -t nat -S CNI-HOSTPORT-SETMARK 1 --wait"
        }), "). To accomplish that, run the command ", (0,jsx_runtime.jsx)(_components.code, {
          children: "sudo modprobe ip_tables"
        }), " to enable the required module, and then the command ", (0,jsx_runtime.jsx)(_components.code, {
          children: "lsmod | grep ip_tables"
        }), " to check if it is enabled."]
      })
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