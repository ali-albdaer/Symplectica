var hl=Object.defineProperty;var ul=(i,t,e)=>t in i?hl(i,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):i[t]=e;var L=(i,t,e)=>ul(i,typeof t!="symbol"?t+"":t,e);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const o of r.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function e(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(s){if(s.ep)return;s.ep=!0;const r=e(s);fetch(s.href,r)}})();/**
 * @license
 * Copyright 2010-2023 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const Ar="160",dl=0,Hr=1,fl=2,xo=1,pl=2,ln=3,bn=0,be=1,tn=2,En=0,ci=1,ps=2,Gr=3,Vr=4,ml=5,Nn=100,gl=101,_l=102,kr=103,Wr=104,vl=200,xl=201,Ml=202,Sl=203,dr=204,fr=205,yl=206,El=207,Tl=208,Al=209,bl=210,wl=211,Rl=212,Cl=213,Pl=214,Ll=0,Dl=1,Il=2,ms=3,Ul=4,Nl=5,Fl=6,Ol=7,Mo=0,Bl=1,zl=2,Tn=0,Hl=1,Gl=2,Vl=3,So=4,kl=5,Wl=6,yo=300,di=301,fi=302,pr=303,mr=304,Ts=306,gr=1e3,He=1001,_r=1002,Te=1003,Xr=1004,Ds=1005,ze=1006,Xl=1007,Di=1008,An=1009,ql=1010,Yl=1011,br=1012,Eo=1013,Mn=1014,Sn=1015,Ii=1016,To=1017,Ao=1018,On=1020,$l=1021,Ye=1023,jl=1024,Kl=1025,Bn=1026,pi=1027,Zl=1028,bo=1029,Jl=1030,wo=1031,Ro=1033,Is=33776,Us=33777,Ns=33778,Fs=33779,qr=35840,Yr=35841,$r=35842,jr=35843,Co=36196,Kr=37492,Zr=37496,Jr=37808,Qr=37809,ta=37810,ea=37811,na=37812,ia=37813,sa=37814,ra=37815,aa=37816,oa=37817,la=37818,ca=37819,ha=37820,ua=37821,Os=36492,da=36494,fa=36495,Ql=36283,pa=36284,ma=36285,ga=36286,Po=3e3,zn=3001,tc=3200,ec=3201,Lo=0,nc=1,Ge="",fe="srgb",dn="srgb-linear",wr="display-p3",As="display-p3-linear",gs="linear",Jt="srgb",_s="rec709",vs="p3",Wn=7680,_a=519,ic=512,sc=513,rc=514,Do=515,ac=516,oc=517,lc=518,cc=519,va=35044,xa="300 es",vr=1035,cn=2e3,xs=2001;class vi{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[t]===void 0&&(n[t]=[]),n[t].indexOf(e)===-1&&n[t].push(e)}hasEventListener(t,e){if(this._listeners===void 0)return!1;const n=this._listeners;return n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){if(this._listeners===void 0)return;const s=this._listeners[t];if(s!==void 0){const r=s.indexOf(e);r!==-1&&s.splice(r,1)}}dispatchEvent(t){if(this._listeners===void 0)return;const n=this._listeners[t.type];if(n!==void 0){t.target=this;const s=n.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,t);t.target=null}}}const ge=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Bs=Math.PI/180,xr=180/Math.PI;function Ni(){const i=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(ge[i&255]+ge[i>>8&255]+ge[i>>16&255]+ge[i>>24&255]+"-"+ge[t&255]+ge[t>>8&255]+"-"+ge[t>>16&15|64]+ge[t>>24&255]+"-"+ge[e&63|128]+ge[e>>8&255]+"-"+ge[e>>16&255]+ge[e>>24&255]+ge[n&255]+ge[n>>8&255]+ge[n>>16&255]+ge[n>>24&255]).toLowerCase()}function Pe(i,t,e){return Math.max(t,Math.min(e,i))}function hc(i,t){return(i%t+t)%t}function zs(i,t,e){return(1-e)*i+e*t}function Ma(i){return(i&i-1)===0&&i!==0}function Mr(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function yi(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function Ce(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}class kt{constructor(t=0,e=0){kt.prototype.isVector2=!0,this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){const e=this.x,n=this.y,s=t.elements;return this.x=s[0]*e+s[3]*n+s[6],this.y=s[1]*e+s[4]*n+s[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const n=this.dot(t)/e;return Math.acos(Pe(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){const n=Math.cos(e),s=Math.sin(e),r=this.x-t.x,o=this.y-t.y;return this.x=r*n-o*s+t.x,this.y=r*s+o*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class zt{constructor(t,e,n,s,r,o,a,l,c){zt.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,o,a,l,c)}set(t,e,n,s,r,o,a,l,c){const h=this.elements;return h[0]=t,h[1]=s,h[2]=a,h[3]=e,h[4]=r,h[5]=l,h[6]=n,h[7]=o,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){const e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){const e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const n=t.elements,s=e.elements,r=this.elements,o=n[0],a=n[3],l=n[6],c=n[1],h=n[4],d=n[7],p=n[2],m=n[5],_=n[8],g=s[0],f=s[3],u=s[6],T=s[1],y=s[4],A=s[7],C=s[2],b=s[5],w=s[8];return r[0]=o*g+a*T+l*C,r[3]=o*f+a*y+l*b,r[6]=o*u+a*A+l*w,r[1]=c*g+h*T+d*C,r[4]=c*f+h*y+d*b,r[7]=c*u+h*A+d*w,r[2]=p*g+m*T+_*C,r[5]=p*f+m*y+_*b,r[8]=p*u+m*A+_*w,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){const t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8];return e*o*h-e*a*c-n*r*h+n*a*l+s*r*c-s*o*l}invert(){const t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8],d=h*o-a*c,p=a*l-h*r,m=c*r-o*l,_=e*d+n*p+s*m;if(_===0)return this.set(0,0,0,0,0,0,0,0,0);const g=1/_;return t[0]=d*g,t[1]=(s*c-h*n)*g,t[2]=(a*n-s*o)*g,t[3]=p*g,t[4]=(h*e-s*l)*g,t[5]=(s*r-a*e)*g,t[6]=m*g,t[7]=(n*l-c*e)*g,t[8]=(o*e-n*r)*g,this}transpose(){let t;const e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){const e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,s,r,o,a){const l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*o+c*a)+o+t,-s*c,s*l,-s*(-c*o+l*a)+a+e,0,0,1),this}scale(t,e){return this.premultiply(Hs.makeScale(t,e)),this}rotate(t){return this.premultiply(Hs.makeRotation(-t)),this}translate(t,e){return this.premultiply(Hs.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){const e=this.elements,n=t.elements;for(let s=0;s<9;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){const n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}}const Hs=new zt;function Io(i){for(let t=i.length-1;t>=0;--t)if(i[t]>=65535)return!0;return!1}function Ms(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function uc(){const i=Ms("canvas");return i.style.display="block",i}const Sa={};function Pi(i){i in Sa||(Sa[i]=!0,console.warn(i))}const ya=new zt().set(.8224621,.177538,0,.0331941,.9668058,0,.0170827,.0723974,.9105199),Ea=new zt().set(1.2249401,-.2249404,0,-.0420569,1.0420571,0,-.0196376,-.0786361,1.0982735),Gi={[dn]:{transfer:gs,primaries:_s,toReference:i=>i,fromReference:i=>i},[fe]:{transfer:Jt,primaries:_s,toReference:i=>i.convertSRGBToLinear(),fromReference:i=>i.convertLinearToSRGB()},[As]:{transfer:gs,primaries:vs,toReference:i=>i.applyMatrix3(Ea),fromReference:i=>i.applyMatrix3(ya)},[wr]:{transfer:Jt,primaries:vs,toReference:i=>i.convertSRGBToLinear().applyMatrix3(Ea),fromReference:i=>i.applyMatrix3(ya).convertLinearToSRGB()}},dc=new Set([dn,As]),Yt={enabled:!0,_workingColorSpace:dn,get workingColorSpace(){return this._workingColorSpace},set workingColorSpace(i){if(!dc.has(i))throw new Error(`Unsupported working color space, "${i}".`);this._workingColorSpace=i},convert:function(i,t,e){if(this.enabled===!1||t===e||!t||!e)return i;const n=Gi[t].toReference,s=Gi[e].fromReference;return s(n(i))},fromWorkingColorSpace:function(i,t){return this.convert(i,this._workingColorSpace,t)},toWorkingColorSpace:function(i,t){return this.convert(i,t,this._workingColorSpace)},getPrimaries:function(i){return Gi[i].primaries},getTransfer:function(i){return i===Ge?gs:Gi[i].transfer}};function hi(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Gs(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}let Xn;class Uo{static getDataURL(t){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let e;if(t instanceof HTMLCanvasElement)e=t;else{Xn===void 0&&(Xn=Ms("canvas")),Xn.width=t.width,Xn.height=t.height;const n=Xn.getContext("2d");t instanceof ImageData?n.putImageData(t,0,0):n.drawImage(t,0,0,t.width,t.height),e=Xn}return e.width>2048||e.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",t),e.toDataURL("image/jpeg",.6)):e.toDataURL("image/png")}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){const e=Ms("canvas");e.width=t.width,e.height=t.height;const n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);const s=n.getImageData(0,0,t.width,t.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=hi(r[o]/255)*255;return n.putImageData(s,0,0),e}else if(t.data){const e=t.data.slice(0);for(let n=0;n<e.length;n++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[n]=Math.floor(hi(e[n]/255)*255):e[n]=hi(e[n]);return{data:e,width:t.width,height:t.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}}let fc=0;class No{constructor(t=null){this.isSource=!0,Object.defineProperty(this,"id",{value:fc++}),this.uuid=Ni(),this.data=t,this.version=0}set needsUpdate(t){t===!0&&this.version++}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];const n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push(Vs(s[o].image)):r.push(Vs(s[o]))}else r=Vs(s);n.url=r}return e||(t.images[this.uuid]=n),n}}function Vs(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?Uo.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let pc=0;class Le extends vi{constructor(t=Le.DEFAULT_IMAGE,e=Le.DEFAULT_MAPPING,n=He,s=He,r=ze,o=Di,a=Ye,l=An,c=Le.DEFAULT_ANISOTROPY,h=Ge){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:pc++}),this.uuid=Ni(),this.name="",this.source=new No(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new kt(0,0),this.repeat=new kt(1,1),this.center=new kt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new zt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,typeof h=="string"?this.colorSpace=h:(Pi("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace=h===zn?fe:Ge),this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.needsPMREMUpdate=!1}get image(){return this.source.data}set image(t=null){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];const n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),e||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==yo)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case gr:t.x=t.x-Math.floor(t.x);break;case He:t.x=t.x<0?0:1;break;case _r:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case gr:t.y=t.y-Math.floor(t.y);break;case He:t.y=t.y<0?0:1;break;case _r:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}get encoding(){return Pi("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace===fe?zn:Po}set encoding(t){Pi("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace=t===zn?fe:Ge}}Le.DEFAULT_IMAGE=null;Le.DEFAULT_MAPPING=yo;Le.DEFAULT_ANISOTROPY=1;class Qt{constructor(t=0,e=0,n=0,s=1){Qt.prototype.isVector4=!0,this.x=t,this.y=e,this.z=n,this.w=s}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,s){return this.x=t,this.y=e,this.z=n,this.w=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){const e=this.x,n=this.y,s=this.z,r=this.w,o=t.elements;return this.x=o[0]*e+o[4]*n+o[8]*s+o[12]*r,this.y=o[1]*e+o[5]*n+o[9]*s+o[13]*r,this.z=o[2]*e+o[6]*n+o[10]*s+o[14]*r,this.w=o[3]*e+o[7]*n+o[11]*s+o[15]*r,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);const e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,n,s,r;const l=t.elements,c=l[0],h=l[4],d=l[8],p=l[1],m=l[5],_=l[9],g=l[2],f=l[6],u=l[10];if(Math.abs(h-p)<.01&&Math.abs(d-g)<.01&&Math.abs(_-f)<.01){if(Math.abs(h+p)<.1&&Math.abs(d+g)<.1&&Math.abs(_+f)<.1&&Math.abs(c+m+u-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;const y=(c+1)/2,A=(m+1)/2,C=(u+1)/2,b=(h+p)/4,w=(d+g)/4,$=(_+f)/4;return y>A&&y>C?y<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(y),s=b/n,r=w/n):A>C?A<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(A),n=b/s,r=$/s):C<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(C),n=w/r,s=$/r),this.set(n,s,r,e),this}let T=Math.sqrt((f-_)*(f-_)+(d-g)*(d-g)+(p-h)*(p-h));return Math.abs(T)<.001&&(T=1),this.x=(f-_)/T,this.y=(d-g)/T,this.z=(p-h)/T,this.w=Math.acos((c+m+u-1)/2),this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this.w=Math.max(t.w,Math.min(e.w,this.w)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this.w=Math.max(t,Math.min(e,this.w)),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class mc extends vi{constructor(t=1,e=1,n={}){super(),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=1,this.scissor=new Qt(0,0,t,e),this.scissorTest=!1,this.viewport=new Qt(0,0,t,e);const s={width:t,height:e,depth:1};n.encoding!==void 0&&(Pi("THREE.WebGLRenderTarget: option.encoding has been replaced by option.colorSpace."),n.colorSpace=n.encoding===zn?fe:Ge),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:ze,depthBuffer:!0,stencilBuffer:!1,depthTexture:null,samples:0},n),this.texture=new Le(s,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.flipY=!1,this.texture.generateMipmaps=n.generateMipmaps,this.texture.internalFormat=n.internalFormat,this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}setSize(t,e,n=1){(this.width!==t||this.height!==e||this.depth!==n)&&(this.width=t,this.height=e,this.depth=n,this.texture.image.width=t,this.texture.image.height=e,this.texture.image.depth=n,this.dispose()),this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.texture=t.texture.clone(),this.texture.isRenderTargetTexture=!0;const e=Object.assign({},t.texture.image);return this.texture.source=new No(e),this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,t.depthTexture!==null&&(this.depthTexture=t.depthTexture.clone()),this.samples=t.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Hn extends mc{constructor(t=1,e=1,n={}){super(t,e,n),this.isWebGLRenderTarget=!0}}class Fo extends Le{constructor(t=null,e=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=Te,this.minFilter=Te,this.wrapR=He,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class gc extends Le{constructor(t=null,e=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=Te,this.minFilter=Te,this.wrapR=He,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}let xi=class{constructor(t=0,e=0,n=0,s=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=s}static slerpFlat(t,e,n,s,r,o,a){let l=n[s+0],c=n[s+1],h=n[s+2],d=n[s+3];const p=r[o+0],m=r[o+1],_=r[o+2],g=r[o+3];if(a===0){t[e+0]=l,t[e+1]=c,t[e+2]=h,t[e+3]=d;return}if(a===1){t[e+0]=p,t[e+1]=m,t[e+2]=_,t[e+3]=g;return}if(d!==g||l!==p||c!==m||h!==_){let f=1-a;const u=l*p+c*m+h*_+d*g,T=u>=0?1:-1,y=1-u*u;if(y>Number.EPSILON){const C=Math.sqrt(y),b=Math.atan2(C,u*T);f=Math.sin(f*b)/C,a=Math.sin(a*b)/C}const A=a*T;if(l=l*f+p*A,c=c*f+m*A,h=h*f+_*A,d=d*f+g*A,f===1-a){const C=1/Math.sqrt(l*l+c*c+h*h+d*d);l*=C,c*=C,h*=C,d*=C}}t[e]=l,t[e+1]=c,t[e+2]=h,t[e+3]=d}static multiplyQuaternionsFlat(t,e,n,s,r,o){const a=n[s],l=n[s+1],c=n[s+2],h=n[s+3],d=r[o],p=r[o+1],m=r[o+2],_=r[o+3];return t[e]=a*_+h*d+l*m-c*p,t[e+1]=l*_+h*p+c*d-a*m,t[e+2]=c*_+h*m+a*p-l*d,t[e+3]=h*_-a*d-l*p-c*m,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,s){return this._x=t,this._y=e,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){const n=t._x,s=t._y,r=t._z,o=t._order,a=Math.cos,l=Math.sin,c=a(n/2),h=a(s/2),d=a(r/2),p=l(n/2),m=l(s/2),_=l(r/2);switch(o){case"XYZ":this._x=p*h*d+c*m*_,this._y=c*m*d-p*h*_,this._z=c*h*_+p*m*d,this._w=c*h*d-p*m*_;break;case"YXZ":this._x=p*h*d+c*m*_,this._y=c*m*d-p*h*_,this._z=c*h*_-p*m*d,this._w=c*h*d+p*m*_;break;case"ZXY":this._x=p*h*d-c*m*_,this._y=c*m*d+p*h*_,this._z=c*h*_+p*m*d,this._w=c*h*d-p*m*_;break;case"ZYX":this._x=p*h*d-c*m*_,this._y=c*m*d+p*h*_,this._z=c*h*_-p*m*d,this._w=c*h*d+p*m*_;break;case"YZX":this._x=p*h*d+c*m*_,this._y=c*m*d+p*h*_,this._z=c*h*_-p*m*d,this._w=c*h*d-p*m*_;break;case"XZY":this._x=p*h*d-c*m*_,this._y=c*m*d-p*h*_,this._z=c*h*_+p*m*d,this._w=c*h*d+p*m*_;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){const n=e/2,s=Math.sin(n);return this._x=t.x*s,this._y=t.y*s,this._z=t.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){const e=t.elements,n=e[0],s=e[4],r=e[8],o=e[1],a=e[5],l=e[9],c=e[2],h=e[6],d=e[10],p=n+a+d;if(p>0){const m=.5/Math.sqrt(p+1);this._w=.25/m,this._x=(h-l)*m,this._y=(r-c)*m,this._z=(o-s)*m}else if(n>a&&n>d){const m=2*Math.sqrt(1+n-a-d);this._w=(h-l)/m,this._x=.25*m,this._y=(s+o)/m,this._z=(r+c)/m}else if(a>d){const m=2*Math.sqrt(1+a-n-d);this._w=(r-c)/m,this._x=(s+o)/m,this._y=.25*m,this._z=(l+h)/m}else{const m=2*Math.sqrt(1+d-n-a);this._w=(o-s)/m,this._x=(r+c)/m,this._y=(l+h)/m,this._z=.25*m}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;return n<Number.EPSILON?(n=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=n):(this._x=0,this._y=-t.z,this._z=t.y,this._w=n)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(Pe(this.dot(t),-1,1)))}rotateTowards(t,e){const n=this.angleTo(t);if(n===0)return this;const s=Math.min(1,e/n);return this.slerp(t,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){const n=t._x,s=t._y,r=t._z,o=t._w,a=e._x,l=e._y,c=e._z,h=e._w;return this._x=n*h+o*a+s*c-r*l,this._y=s*h+o*l+r*a-n*c,this._z=r*h+o*c+n*l-s*a,this._w=o*h-n*a-s*l-r*c,this._onChangeCallback(),this}slerp(t,e){if(e===0)return this;if(e===1)return this.copy(t);const n=this._x,s=this._y,r=this._z,o=this._w;let a=o*t._w+n*t._x+s*t._y+r*t._z;if(a<0?(this._w=-t._w,this._x=-t._x,this._y=-t._y,this._z=-t._z,a=-a):this.copy(t),a>=1)return this._w=o,this._x=n,this._y=s,this._z=r,this;const l=1-a*a;if(l<=Number.EPSILON){const m=1-e;return this._w=m*o+e*this._w,this._x=m*n+e*this._x,this._y=m*s+e*this._y,this._z=m*r+e*this._z,this.normalize(),this}const c=Math.sqrt(l),h=Math.atan2(c,a),d=Math.sin((1-e)*h)/c,p=Math.sin(e*h)/c;return this._w=o*d+this._w*p,this._x=n*d+this._x*p,this._y=s*d+this._y*p,this._z=r*d+this._z*p,this._onChangeCallback(),this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){const t=Math.random(),e=Math.sqrt(1-t),n=Math.sqrt(t),s=2*Math.PI*Math.random(),r=2*Math.PI*Math.random();return this.set(e*Math.cos(s),n*Math.sin(r),n*Math.cos(r),e*Math.sin(s))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},D=class Oo{constructor(t=0,e=0,n=0){Oo.prototype.isVector3=!0,this.x=t,this.y=e,this.z=n}set(t,e,n){return n===void 0&&(n=this.z),this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(Ta.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(Ta.setFromAxisAngle(t,e))}applyMatrix3(t){const e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[3]*n+r[6]*s,this.y=r[1]*e+r[4]*n+r[7]*s,this.z=r[2]*e+r[5]*n+r[8]*s,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){const e=this.x,n=this.y,s=this.z,r=t.elements,o=1/(r[3]*e+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*e+r[4]*n+r[8]*s+r[12])*o,this.y=(r[1]*e+r[5]*n+r[9]*s+r[13])*o,this.z=(r[2]*e+r[6]*n+r[10]*s+r[14])*o,this}applyQuaternion(t){const e=this.x,n=this.y,s=this.z,r=t.x,o=t.y,a=t.z,l=t.w,c=2*(o*s-a*n),h=2*(a*e-r*s),d=2*(r*n-o*e);return this.x=e+l*c+o*d-a*h,this.y=n+l*h+a*c-r*d,this.z=s+l*d+r*h-o*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){const e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[4]*n+r[8]*s,this.y=r[1]*e+r[5]*n+r[9]*s,this.z=r[2]*e+r[6]*n+r[10]*s,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){const n=t.x,s=t.y,r=t.z,o=e.x,a=e.y,l=e.z;return this.x=s*l-r*a,this.y=r*o-n*l,this.z=n*a-s*o,this}projectOnVector(t){const e=t.lengthSq();if(e===0)return this.set(0,0,0);const n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return ks.copy(this).projectOnVector(t),this.sub(ks)}reflect(t){return this.sub(ks.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const n=this.dot(t)/e;return Math.acos(Pe(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,n=this.y-t.y,s=this.z-t.z;return e*e+n*n+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){const s=Math.sin(e)*t;return this.x=s*Math.sin(n),this.y=Math.cos(e)*t,this.z=s*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){const e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),s=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=s,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const t=(Math.random()-.5)*2,e=Math.random()*Math.PI*2,n=Math.sqrt(1-t**2);return this.x=n*Math.cos(e),this.y=n*Math.sin(e),this.z=t,this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};const ks=new D,Ta=new xi;class Fi{constructor(t=new D(1/0,1/0,1/0),e=new D(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(ke.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(ke.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){const n=ke.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);const n=t.geometry;if(n!==void 0){const r=n.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)t.isMesh===!0?t.getVertexPosition(o,ke):ke.fromBufferAttribute(r,o),ke.applyMatrix4(t.matrixWorld),this.expandByPoint(ke);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),Vi.copy(t.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Vi.copy(n.boundingBox)),Vi.applyMatrix4(t.matrixWorld),this.union(Vi)}const s=t.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],e);return this}containsPoint(t){return!(t.x<this.min.x||t.x>this.max.x||t.y<this.min.y||t.y>this.max.y||t.z<this.min.z||t.z>this.max.z)}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return!(t.max.x<this.min.x||t.min.x>this.max.x||t.max.y<this.min.y||t.min.y>this.max.y||t.max.z<this.min.z||t.min.z>this.max.z)}intersectsSphere(t){return this.clampPoint(t.center,ke),ke.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;return t.normal.x>0?(e=t.normal.x*this.min.x,n=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,n=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z),e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(Ei),ki.subVectors(this.max,Ei),qn.subVectors(t.a,Ei),Yn.subVectors(t.b,Ei),$n.subVectors(t.c,Ei),mn.subVectors(Yn,qn),gn.subVectors($n,Yn),Cn.subVectors(qn,$n);let e=[0,-mn.z,mn.y,0,-gn.z,gn.y,0,-Cn.z,Cn.y,mn.z,0,-mn.x,gn.z,0,-gn.x,Cn.z,0,-Cn.x,-mn.y,mn.x,0,-gn.y,gn.x,0,-Cn.y,Cn.x,0];return!Ws(e,qn,Yn,$n,ki)||(e=[1,0,0,0,1,0,0,0,1],!Ws(e,qn,Yn,$n,ki))?!1:(Wi.crossVectors(mn,gn),e=[Wi.x,Wi.y,Wi.z],Ws(e,qn,Yn,$n,ki))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,ke).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(ke).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(nn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),nn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),nn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),nn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),nn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),nn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),nn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),nn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(nn),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}}const nn=[new D,new D,new D,new D,new D,new D,new D,new D],ke=new D,Vi=new Fi,qn=new D,Yn=new D,$n=new D,mn=new D,gn=new D,Cn=new D,Ei=new D,ki=new D,Wi=new D,Pn=new D;function Ws(i,t,e,n,s){for(let r=0,o=i.length-3;r<=o;r+=3){Pn.fromArray(i,r);const a=s.x*Math.abs(Pn.x)+s.y*Math.abs(Pn.y)+s.z*Math.abs(Pn.z),l=t.dot(Pn),c=e.dot(Pn),h=n.dot(Pn);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>a)return!1}return!0}const _c=new Fi,Ti=new D,Xs=new D;class bs{constructor(t=new D,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){const n=this.center;e!==void 0?n.copy(e):_c.setFromPoints(t).getCenter(n);let s=0;for(let r=0,o=t.length;r<o;r++)s=Math.max(s,n.distanceToSquared(t[r]));return this.radius=Math.sqrt(s),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){const e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){const n=this.center.distanceToSquared(t);return e.copy(t),n>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;Ti.subVectors(t,this.center);const e=Ti.lengthSq();if(e>this.radius*this.radius){const n=Math.sqrt(e),s=(n-this.radius)*.5;this.center.addScaledVector(Ti,s/n),this.radius+=s}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(Xs.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(Ti.copy(t.center).add(Xs)),this.expandByPoint(Ti.copy(t.center).sub(Xs))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}}const sn=new D,qs=new D,Xi=new D,_n=new D,Ys=new D,qi=new D,$s=new D;class Bo{constructor(t=new D,e=new D(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,sn)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);const n=e.dot(this.direction);return n<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){const e=sn.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(sn.copy(this.origin).addScaledVector(this.direction,e),sn.distanceToSquared(t))}distanceSqToSegment(t,e,n,s){qs.copy(t).add(e).multiplyScalar(.5),Xi.copy(e).sub(t).normalize(),_n.copy(this.origin).sub(qs);const r=t.distanceTo(e)*.5,o=-this.direction.dot(Xi),a=_n.dot(this.direction),l=-_n.dot(Xi),c=_n.lengthSq(),h=Math.abs(1-o*o);let d,p,m,_;if(h>0)if(d=o*l-a,p=o*a-l,_=r*h,d>=0)if(p>=-_)if(p<=_){const g=1/h;d*=g,p*=g,m=d*(d+o*p+2*a)+p*(o*d+p+2*l)+c}else p=r,d=Math.max(0,-(o*p+a)),m=-d*d+p*(p+2*l)+c;else p=-r,d=Math.max(0,-(o*p+a)),m=-d*d+p*(p+2*l)+c;else p<=-_?(d=Math.max(0,-(-o*r+a)),p=d>0?-r:Math.min(Math.max(-r,-l),r),m=-d*d+p*(p+2*l)+c):p<=_?(d=0,p=Math.min(Math.max(-r,-l),r),m=p*(p+2*l)+c):(d=Math.max(0,-(o*r+a)),p=d>0?r:Math.min(Math.max(-r,-l),r),m=-d*d+p*(p+2*l)+c);else p=o>0?-r:r,d=Math.max(0,-(o*p+a)),m=-d*d+p*(p+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,d),s&&s.copy(qs).addScaledVector(Xi,p),m}intersectSphere(t,e){sn.subVectors(t.center,this.origin);const n=sn.dot(this.direction),s=sn.dot(sn)-n*n,r=t.radius*t.radius;if(s>r)return null;const o=Math.sqrt(r-s),a=n-o,l=n+o;return l<0?null:a<0?this.at(l,e):this.at(a,e)}intersectsSphere(t){return this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){const e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){const n=this.distanceToPlane(t);return n===null?null:this.at(n,e)}intersectsPlane(t){const e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let n,s,r,o,a,l;const c=1/this.direction.x,h=1/this.direction.y,d=1/this.direction.z,p=this.origin;return c>=0?(n=(t.min.x-p.x)*c,s=(t.max.x-p.x)*c):(n=(t.max.x-p.x)*c,s=(t.min.x-p.x)*c),h>=0?(r=(t.min.y-p.y)*h,o=(t.max.y-p.y)*h):(r=(t.max.y-p.y)*h,o=(t.min.y-p.y)*h),n>o||r>s||((r>n||isNaN(n))&&(n=r),(o<s||isNaN(s))&&(s=o),d>=0?(a=(t.min.z-p.z)*d,l=(t.max.z-p.z)*d):(a=(t.max.z-p.z)*d,l=(t.min.z-p.z)*d),n>l||a>s)||((a>n||n!==n)&&(n=a),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,e)}intersectsBox(t){return this.intersectBox(t,sn)!==null}intersectTriangle(t,e,n,s,r){Ys.subVectors(e,t),qi.subVectors(n,t),$s.crossVectors(Ys,qi);let o=this.direction.dot($s),a;if(o>0){if(s)return null;a=1}else if(o<0)a=-1,o=-o;else return null;_n.subVectors(this.origin,t);const l=a*this.direction.dot(qi.crossVectors(_n,qi));if(l<0)return null;const c=a*this.direction.dot(Ys.cross(_n));if(c<0||l+c>o)return null;const h=-a*_n.dot($s);return h<0?null:this.at(h/o,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class re{constructor(t,e,n,s,r,o,a,l,c,h,d,p,m,_,g,f){re.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,o,a,l,c,h,d,p,m,_,g,f)}set(t,e,n,s,r,o,a,l,c,h,d,p,m,_,g,f){const u=this.elements;return u[0]=t,u[4]=e,u[8]=n,u[12]=s,u[1]=r,u[5]=o,u[9]=a,u[13]=l,u[2]=c,u[6]=h,u[10]=d,u[14]=p,u[3]=m,u[7]=_,u[11]=g,u[15]=f,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new re().fromArray(this.elements)}copy(t){const e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){const e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){const e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){return t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){const e=this.elements,n=t.elements,s=1/jn.setFromMatrixColumn(t,0).length(),r=1/jn.setFromMatrixColumn(t,1).length(),o=1/jn.setFromMatrixColumn(t,2).length();return e[0]=n[0]*s,e[1]=n[1]*s,e[2]=n[2]*s,e[3]=0,e[4]=n[4]*r,e[5]=n[5]*r,e[6]=n[6]*r,e[7]=0,e[8]=n[8]*o,e[9]=n[9]*o,e[10]=n[10]*o,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){const e=this.elements,n=t.x,s=t.y,r=t.z,o=Math.cos(n),a=Math.sin(n),l=Math.cos(s),c=Math.sin(s),h=Math.cos(r),d=Math.sin(r);if(t.order==="XYZ"){const p=o*h,m=o*d,_=a*h,g=a*d;e[0]=l*h,e[4]=-l*d,e[8]=c,e[1]=m+_*c,e[5]=p-g*c,e[9]=-a*l,e[2]=g-p*c,e[6]=_+m*c,e[10]=o*l}else if(t.order==="YXZ"){const p=l*h,m=l*d,_=c*h,g=c*d;e[0]=p+g*a,e[4]=_*a-m,e[8]=o*c,e[1]=o*d,e[5]=o*h,e[9]=-a,e[2]=m*a-_,e[6]=g+p*a,e[10]=o*l}else if(t.order==="ZXY"){const p=l*h,m=l*d,_=c*h,g=c*d;e[0]=p-g*a,e[4]=-o*d,e[8]=_+m*a,e[1]=m+_*a,e[5]=o*h,e[9]=g-p*a,e[2]=-o*c,e[6]=a,e[10]=o*l}else if(t.order==="ZYX"){const p=o*h,m=o*d,_=a*h,g=a*d;e[0]=l*h,e[4]=_*c-m,e[8]=p*c+g,e[1]=l*d,e[5]=g*c+p,e[9]=m*c-_,e[2]=-c,e[6]=a*l,e[10]=o*l}else if(t.order==="YZX"){const p=o*l,m=o*c,_=a*l,g=a*c;e[0]=l*h,e[4]=g-p*d,e[8]=_*d+m,e[1]=d,e[5]=o*h,e[9]=-a*h,e[2]=-c*h,e[6]=m*d+_,e[10]=p-g*d}else if(t.order==="XZY"){const p=o*l,m=o*c,_=a*l,g=a*c;e[0]=l*h,e[4]=-d,e[8]=c*h,e[1]=p*d+g,e[5]=o*h,e[9]=m*d-_,e[2]=_*d-m,e[6]=a*h,e[10]=g*d+p}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(vc,t,xc)}lookAt(t,e,n){const s=this.elements;return Ie.subVectors(t,e),Ie.lengthSq()===0&&(Ie.z=1),Ie.normalize(),vn.crossVectors(n,Ie),vn.lengthSq()===0&&(Math.abs(n.z)===1?Ie.x+=1e-4:Ie.z+=1e-4,Ie.normalize(),vn.crossVectors(n,Ie)),vn.normalize(),Yi.crossVectors(Ie,vn),s[0]=vn.x,s[4]=Yi.x,s[8]=Ie.x,s[1]=vn.y,s[5]=Yi.y,s[9]=Ie.y,s[2]=vn.z,s[6]=Yi.z,s[10]=Ie.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const n=t.elements,s=e.elements,r=this.elements,o=n[0],a=n[4],l=n[8],c=n[12],h=n[1],d=n[5],p=n[9],m=n[13],_=n[2],g=n[6],f=n[10],u=n[14],T=n[3],y=n[7],A=n[11],C=n[15],b=s[0],w=s[4],$=s[8],M=s[12],E=s[1],V=s[5],W=s[9],nt=s[13],P=s[2],H=s[6],k=s[10],Y=s[14],X=s[3],q=s[7],j=s[11],et=s[15];return r[0]=o*b+a*E+l*P+c*X,r[4]=o*w+a*V+l*H+c*q,r[8]=o*$+a*W+l*k+c*j,r[12]=o*M+a*nt+l*Y+c*et,r[1]=h*b+d*E+p*P+m*X,r[5]=h*w+d*V+p*H+m*q,r[9]=h*$+d*W+p*k+m*j,r[13]=h*M+d*nt+p*Y+m*et,r[2]=_*b+g*E+f*P+u*X,r[6]=_*w+g*V+f*H+u*q,r[10]=_*$+g*W+f*k+u*j,r[14]=_*M+g*nt+f*Y+u*et,r[3]=T*b+y*E+A*P+C*X,r[7]=T*w+y*V+A*H+C*q,r[11]=T*$+y*W+A*k+C*j,r[15]=T*M+y*nt+A*Y+C*et,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){const t=this.elements,e=t[0],n=t[4],s=t[8],r=t[12],o=t[1],a=t[5],l=t[9],c=t[13],h=t[2],d=t[6],p=t[10],m=t[14],_=t[3],g=t[7],f=t[11],u=t[15];return _*(+r*l*d-s*c*d-r*a*p+n*c*p+s*a*m-n*l*m)+g*(+e*l*m-e*c*p+r*o*p-s*o*m+s*c*h-r*l*h)+f*(+e*c*d-e*a*m-r*o*d+n*o*m+r*a*h-n*c*h)+u*(-s*a*h-e*l*d+e*a*p+s*o*d-n*o*p+n*l*h)}transpose(){const t=this.elements;let e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){const s=this.elements;return t.isVector3?(s[12]=t.x,s[13]=t.y,s[14]=t.z):(s[12]=t,s[13]=e,s[14]=n),this}invert(){const t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8],d=t[9],p=t[10],m=t[11],_=t[12],g=t[13],f=t[14],u=t[15],T=d*f*c-g*p*c+g*l*m-a*f*m-d*l*u+a*p*u,y=_*p*c-h*f*c-_*l*m+o*f*m+h*l*u-o*p*u,A=h*g*c-_*d*c+_*a*m-o*g*m-h*a*u+o*d*u,C=_*d*l-h*g*l-_*a*p+o*g*p+h*a*f-o*d*f,b=e*T+n*y+s*A+r*C;if(b===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const w=1/b;return t[0]=T*w,t[1]=(g*p*r-d*f*r-g*s*m+n*f*m+d*s*u-n*p*u)*w,t[2]=(a*f*r-g*l*r+g*s*c-n*f*c-a*s*u+n*l*u)*w,t[3]=(d*l*r-a*p*r-d*s*c+n*p*c+a*s*m-n*l*m)*w,t[4]=y*w,t[5]=(h*f*r-_*p*r+_*s*m-e*f*m-h*s*u+e*p*u)*w,t[6]=(_*l*r-o*f*r-_*s*c+e*f*c+o*s*u-e*l*u)*w,t[7]=(o*p*r-h*l*r+h*s*c-e*p*c-o*s*m+e*l*m)*w,t[8]=A*w,t[9]=(_*d*r-h*g*r-_*n*m+e*g*m+h*n*u-e*d*u)*w,t[10]=(o*g*r-_*a*r+_*n*c-e*g*c-o*n*u+e*a*u)*w,t[11]=(h*a*r-o*d*r-h*n*c+e*d*c+o*n*m-e*a*m)*w,t[12]=C*w,t[13]=(h*g*s-_*d*s+_*n*p-e*g*p-h*n*f+e*d*f)*w,t[14]=(_*a*s-o*g*s-_*n*l+e*g*l+o*n*f-e*a*f)*w,t[15]=(o*d*s-h*a*s+h*n*l-e*d*l-o*n*p+e*a*p)*w,this}scale(t){const e=this.elements,n=t.x,s=t.y,r=t.z;return e[0]*=n,e[4]*=s,e[8]*=r,e[1]*=n,e[5]*=s,e[9]*=r,e[2]*=n,e[6]*=s,e[10]*=r,e[3]*=n,e[7]*=s,e[11]*=r,this}getMaxScaleOnAxis(){const t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],s=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,s))}makeTranslation(t,e,n){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1),this}makeRotationX(t){const e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){const n=Math.cos(e),s=Math.sin(e),r=1-n,o=t.x,a=t.y,l=t.z,c=r*o,h=r*a;return this.set(c*o+n,c*a-s*l,c*l+s*a,0,c*a+s*l,h*a+n,h*l-s*o,0,c*l-s*a,h*l+s*o,r*l*l+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,s,r,o){return this.set(1,n,r,0,t,1,o,0,e,s,1,0,0,0,0,1),this}compose(t,e,n){const s=this.elements,r=e._x,o=e._y,a=e._z,l=e._w,c=r+r,h=o+o,d=a+a,p=r*c,m=r*h,_=r*d,g=o*h,f=o*d,u=a*d,T=l*c,y=l*h,A=l*d,C=n.x,b=n.y,w=n.z;return s[0]=(1-(g+u))*C,s[1]=(m+A)*C,s[2]=(_-y)*C,s[3]=0,s[4]=(m-A)*b,s[5]=(1-(p+u))*b,s[6]=(f+T)*b,s[7]=0,s[8]=(_+y)*w,s[9]=(f-T)*w,s[10]=(1-(p+g))*w,s[11]=0,s[12]=t.x,s[13]=t.y,s[14]=t.z,s[15]=1,this}decompose(t,e,n){const s=this.elements;let r=jn.set(s[0],s[1],s[2]).length();const o=jn.set(s[4],s[5],s[6]).length(),a=jn.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),t.x=s[12],t.y=s[13],t.z=s[14],We.copy(this);const c=1/r,h=1/o,d=1/a;return We.elements[0]*=c,We.elements[1]*=c,We.elements[2]*=c,We.elements[4]*=h,We.elements[5]*=h,We.elements[6]*=h,We.elements[8]*=d,We.elements[9]*=d,We.elements[10]*=d,e.setFromRotationMatrix(We),n.x=r,n.y=o,n.z=a,this}makePerspective(t,e,n,s,r,o,a=cn){const l=this.elements,c=2*r/(e-t),h=2*r/(n-s),d=(e+t)/(e-t),p=(n+s)/(n-s);let m,_;if(a===cn)m=-(o+r)/(o-r),_=-2*o*r/(o-r);else if(a===xs)m=-o/(o-r),_=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=c,l[4]=0,l[8]=d,l[12]=0,l[1]=0,l[5]=h,l[9]=p,l[13]=0,l[2]=0,l[6]=0,l[10]=m,l[14]=_,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(t,e,n,s,r,o,a=cn){const l=this.elements,c=1/(e-t),h=1/(n-s),d=1/(o-r),p=(e+t)*c,m=(n+s)*h;let _,g;if(a===cn)_=(o+r)*d,g=-2*d;else if(a===xs)_=r*d,g=-1*d;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-p,l[1]=0,l[5]=2*h,l[9]=0,l[13]=-m,l[2]=0,l[6]=0,l[10]=g,l[14]=-_,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(t){const e=this.elements,n=t.elements;for(let s=0;s<16;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){const n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}}const jn=new D,We=new re,vc=new D(0,0,0),xc=new D(1,1,1),vn=new D,Yi=new D,Ie=new D,Aa=new re,ba=new xi;class Oi{constructor(t=0,e=0,n=0,s=Oi.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,s=this._order){return this._x=t,this._y=e,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){const s=t.elements,r=s[0],o=s[4],a=s[8],l=s[1],c=s[5],h=s[9],d=s[2],p=s[6],m=s[10];switch(e){case"XYZ":this._y=Math.asin(Pe(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-h,m),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(p,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Pe(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(a,m),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-d,r),this._z=0);break;case"ZXY":this._x=Math.asin(Pe(p,-1,1)),Math.abs(p)<.9999999?(this._y=Math.atan2(-d,m),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-Pe(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(p,m),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(Pe(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-d,r)):(this._x=0,this._y=Math.atan2(a,m));break;case"XZY":this._z=Math.asin(-Pe(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(p,c),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-h,m),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,n){return Aa.makeRotationFromQuaternion(t),this.setFromRotationMatrix(Aa,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return ba.setFromEuler(this),this.setFromQuaternion(ba,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Oi.DEFAULT_ORDER="XYZ";class zo{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}}let Mc=0;const wa=new D,Kn=new xi,rn=new re,$i=new D,Ai=new D,Sc=new D,yc=new xi,Ra=new D(1,0,0),Ca=new D(0,1,0),Pa=new D(0,0,1),Ec={type:"added"},Tc={type:"removed"};class we extends vi{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Mc++}),this.uuid=Ni(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=we.DEFAULT_UP.clone();const t=new D,e=new Oi,n=new xi,s=new D(1,1,1);function r(){n.setFromEuler(e,!1)}function o(){e.setFromQuaternion(n,void 0,!1)}e._onChange(r),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new re},normalMatrix:{value:new zt}}),this.matrix=new re,this.matrixWorld=new re,this.matrixAutoUpdate=we.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=we.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new zo,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return Kn.setFromAxisAngle(t,e),this.quaternion.multiply(Kn),this}rotateOnWorldAxis(t,e){return Kn.setFromAxisAngle(t,e),this.quaternion.premultiply(Kn),this}rotateX(t){return this.rotateOnAxis(Ra,t)}rotateY(t){return this.rotateOnAxis(Ca,t)}rotateZ(t){return this.rotateOnAxis(Pa,t)}translateOnAxis(t,e){return wa.copy(t).applyQuaternion(this.quaternion),this.position.add(wa.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(Ra,t)}translateY(t){return this.translateOnAxis(Ca,t)}translateZ(t){return this.translateOnAxis(Pa,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(rn.copy(this.matrixWorld).invert())}lookAt(t,e,n){t.isVector3?$i.copy(t):$i.set(t,e,n);const s=this.parent;this.updateWorldMatrix(!0,!1),Ai.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?rn.lookAt(Ai,$i,this.up):rn.lookAt($i,Ai,this.up),this.quaternion.setFromRotationMatrix(rn),s&&(rn.extractRotation(s.matrixWorld),Kn.setFromRotationMatrix(rn),this.quaternion.premultiply(Kn.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.parent!==null&&t.parent.remove(t),t.parent=this,this.children.push(t),t.dispatchEvent(Ec)):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(Tc)),this}removeFromParent(){const t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),rn.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),rn.multiply(t.parent.matrixWorld)),t.applyMatrix4(rn),this.add(t),t.updateWorldMatrix(!1,!0),this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,s=this.children.length;n<s;n++){const o=this.children[n].getObjectByProperty(t,e);if(o!==void 0)return o}}getObjectsByProperty(t,e,n=[]){this[t]===e&&n.push(this);const s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ai,t,Sc),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ai,yc,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);const e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}traverse(t){t(this);const e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);const e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverseVisible(t)}traverseAncestors(t){const e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),this.matrixWorldNeedsUpdate=!1,t=!0);const e=this.children;for(let n=0,s=e.length;n<s;n++){const r=e[n];(r.matrixWorldAutoUpdate===!0||t===!0)&&r.updateMatrixWorld(t)}}updateWorldMatrix(t,e){const n=this.parent;if(t===!0&&n!==null&&n.matrixWorldAutoUpdate===!0&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),e===!0){const s=this.children;for(let r=0,o=s.length;r<o;r++){const a=s[r];a.matrixWorldAutoUpdate===!0&&a.updateWorldMatrix(!1,!0)}}}toJSON(t){const e=t===void 0||typeof t=="string",n={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.visibility=this._visibility,s.active=this._active,s.bounds=this._bounds.map(a=>({boxInitialized:a.boxInitialized,boxMin:a.box.min.toArray(),boxMax:a.box.max.toArray(),sphereInitialized:a.sphereInitialized,sphereRadius:a.sphere.radius,sphereCenter:a.sphere.center.toArray()})),s.maxGeometryCount=this._maxGeometryCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.geometryCount=this._geometryCount,s.matricesTexture=this._matricesTexture.toJSON(t),this.boundingSphere!==null&&(s.boundingSphere={center:s.boundingSphere.center.toArray(),radius:s.boundingSphere.radius}),this.boundingBox!==null&&(s.boundingBox={min:s.boundingBox.min.toArray(),max:s.boundingBox.max.toArray()}));function r(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(t.geometries,this.geometry);const a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){const l=a.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){const d=l[c];r(t.shapes,d)}else r(t.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(r(t.materials,this.material[l]));s.material=a}else s.material=r(t.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(t).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){const l=this.animations[a];s.animations.push(r(t.animations,l))}}if(e){const a=o(t.geometries),l=o(t.materials),c=o(t.textures),h=o(t.images),d=o(t.shapes),p=o(t.skeletons),m=o(t.animations),_=o(t.nodes);a.length>0&&(n.geometries=a),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),d.length>0&&(n.shapes=d),p.length>0&&(n.skeletons=p),m.length>0&&(n.animations=m),_.length>0&&(n.nodes=_)}return n.object=s,n;function o(a){const l=[];for(const c in a){const h=a[c];delete h.metadata,l.push(h)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){const s=t.children[n];this.add(s.clone())}return this}}we.DEFAULT_UP=new D(0,1,0);we.DEFAULT_MATRIX_AUTO_UPDATE=!0;we.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const Xe=new D,an=new D,js=new D,on=new D,Zn=new D,Jn=new D,La=new D,Ks=new D,Zs=new D,Js=new D;let ji=!1;class qe{constructor(t=new D,e=new D,n=new D){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,s){s.subVectors(n,e),Xe.subVectors(t,e),s.cross(Xe);const r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(t,e,n,s,r){Xe.subVectors(s,e),an.subVectors(n,e),js.subVectors(t,e);const o=Xe.dot(Xe),a=Xe.dot(an),l=Xe.dot(js),c=an.dot(an),h=an.dot(js),d=o*c-a*a;if(d===0)return r.set(0,0,0),null;const p=1/d,m=(c*l-a*h)*p,_=(o*h-a*l)*p;return r.set(1-m-_,_,m)}static containsPoint(t,e,n,s){return this.getBarycoord(t,e,n,s,on)===null?!1:on.x>=0&&on.y>=0&&on.x+on.y<=1}static getUV(t,e,n,s,r,o,a,l){return ji===!1&&(console.warn("THREE.Triangle.getUV() has been renamed to THREE.Triangle.getInterpolation()."),ji=!0),this.getInterpolation(t,e,n,s,r,o,a,l)}static getInterpolation(t,e,n,s,r,o,a,l){return this.getBarycoord(t,e,n,s,on)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,on.x),l.addScaledVector(o,on.y),l.addScaledVector(a,on.z),l)}static isFrontFacing(t,e,n,s){return Xe.subVectors(n,e),an.subVectors(t,e),Xe.cross(an).dot(s)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,s){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[s]),this}setFromAttributeAndIndices(t,e,n,s){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,s),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return Xe.subVectors(this.c,this.b),an.subVectors(this.a,this.b),Xe.cross(an).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return qe.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return qe.getBarycoord(t,this.a,this.b,this.c,e)}getUV(t,e,n,s,r){return ji===!1&&(console.warn("THREE.Triangle.getUV() has been renamed to THREE.Triangle.getInterpolation()."),ji=!0),qe.getInterpolation(t,this.a,this.b,this.c,e,n,s,r)}getInterpolation(t,e,n,s,r){return qe.getInterpolation(t,this.a,this.b,this.c,e,n,s,r)}containsPoint(t){return qe.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return qe.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){const n=this.a,s=this.b,r=this.c;let o,a;Zn.subVectors(s,n),Jn.subVectors(r,n),Ks.subVectors(t,n);const l=Zn.dot(Ks),c=Jn.dot(Ks);if(l<=0&&c<=0)return e.copy(n);Zs.subVectors(t,s);const h=Zn.dot(Zs),d=Jn.dot(Zs);if(h>=0&&d<=h)return e.copy(s);const p=l*d-h*c;if(p<=0&&l>=0&&h<=0)return o=l/(l-h),e.copy(n).addScaledVector(Zn,o);Js.subVectors(t,r);const m=Zn.dot(Js),_=Jn.dot(Js);if(_>=0&&m<=_)return e.copy(r);const g=m*c-l*_;if(g<=0&&c>=0&&_<=0)return a=c/(c-_),e.copy(n).addScaledVector(Jn,a);const f=h*_-m*d;if(f<=0&&d-h>=0&&m-_>=0)return La.subVectors(r,s),a=(d-h)/(d-h+(m-_)),e.copy(s).addScaledVector(La,a);const u=1/(f+g+p);return o=g*u,a=p*u,e.copy(n).addScaledVector(Zn,o).addScaledVector(Jn,a)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}}const Ho={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},xn={h:0,s:0,l:0},Ki={h:0,s:0,l:0};function Qs(i,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?i+(t-i)*6*e:e<1/2?t:e<2/3?i+(t-i)*6*(2/3-e):i}class Gt{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){const s=t;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=fe){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,Yt.toWorkingColorSpace(this,e),this}setRGB(t,e,n,s=Yt.workingColorSpace){return this.r=t,this.g=e,this.b=n,Yt.toWorkingColorSpace(this,s),this}setHSL(t,e,n,s=Yt.workingColorSpace){if(t=hc(t,1),e=Pe(e,0,1),n=Pe(n,0,1),e===0)this.r=this.g=this.b=n;else{const r=n<=.5?n*(1+e):n+e-n*e,o=2*n-r;this.r=Qs(o,r,t+1/3),this.g=Qs(o,r,t),this.b=Qs(o,r,t-1/3)}return Yt.toWorkingColorSpace(this,s),this}setStyle(t,e=fe){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+t+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(t)){let r;const o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,e);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:console.warn("THREE.Color: Unknown color model "+t)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(t)){const r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(o===6)return this.setHex(parseInt(r,16),e);console.warn("THREE.Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=fe){const n=Ho[t.toLowerCase()];return n!==void 0?this.setHex(n,e):console.warn("THREE.Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=hi(t.r),this.g=hi(t.g),this.b=hi(t.b),this}copyLinearToSRGB(t){return this.r=Gs(t.r),this.g=Gs(t.g),this.b=Gs(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=fe){return Yt.fromWorkingColorSpace(_e.copy(this),t),Math.round(Pe(_e.r*255,0,255))*65536+Math.round(Pe(_e.g*255,0,255))*256+Math.round(Pe(_e.b*255,0,255))}getHexString(t=fe){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=Yt.workingColorSpace){Yt.fromWorkingColorSpace(_e.copy(this),e);const n=_e.r,s=_e.g,r=_e.b,o=Math.max(n,s,r),a=Math.min(n,s,r);let l,c;const h=(a+o)/2;if(a===o)l=0,c=0;else{const d=o-a;switch(c=h<=.5?d/(o+a):d/(2-o-a),o){case n:l=(s-r)/d+(s<r?6:0);break;case s:l=(r-n)/d+2;break;case r:l=(n-s)/d+4;break}l/=6}return t.h=l,t.s=c,t.l=h,t}getRGB(t,e=Yt.workingColorSpace){return Yt.fromWorkingColorSpace(_e.copy(this),e),t.r=_e.r,t.g=_e.g,t.b=_e.b,t}getStyle(t=fe){Yt.fromWorkingColorSpace(_e.copy(this),t);const e=_e.r,n=_e.g,s=_e.b;return t!==fe?`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(t,e,n){return this.getHSL(xn),this.setHSL(xn.h+t,xn.s+e,xn.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(xn),t.getHSL(Ki);const n=zs(xn.h,Ki.h,e),s=zs(xn.s,Ki.s,e),r=zs(xn.l,Ki.l,e);return this.setHSL(n,s,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){const e=this.r,n=this.g,s=this.b,r=t.elements;return this.r=r[0]*e+r[3]*n+r[6]*s,this.g=r[1]*e+r[4]*n+r[7]*s,this.b=r[2]*e+r[5]*n+r[8]*s,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const _e=new Gt;Gt.NAMES=Ho;let Ac=0;class un extends vi{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Ac++}),this.uuid=Ni(),this.name="",this.type="Material",this.blending=ci,this.side=bn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=dr,this.blendDst=fr,this.blendEquation=Nn,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Gt(0,0,0),this.blendAlpha=0,this.depthFunc=ms,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=_a,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Wn,this.stencilZFail=Wn,this.stencilZPass=Wn,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBuild(){}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(const e in t){const n=t[e];if(n===void 0){console.warn(`THREE.Material: parameter '${e}' has value of undefined.`);continue}const s=this[e];if(s===void 0){console.warn(`THREE.Material: '${e}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[e]=n}}toJSON(t){const e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});const n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==ci&&(n.blending=this.blending),this.side!==bn&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==dr&&(n.blendSrc=this.blendSrc),this.blendDst!==fr&&(n.blendDst=this.blendDst),this.blendEquation!==Nn&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==ms&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==_a&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Wn&&(n.stencilFail=this.stencilFail),this.stencilZFail!==Wn&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==Wn&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){const o=[];for(const a in r){const l=r[a];delete l.metadata,o.push(l)}return o}if(e){const r=s(t.textures),o=s(t.images);r.length>0&&(n.textures=r),o.length>0&&(n.images=o)}return n}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;const e=t.clippingPlanes;let n=null;if(e!==null){const s=e.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=e[r].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}}class Li extends un{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Gt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.combine=Mo,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}}const ae=new D,Zi=new kt;class Ae{constructor(t,e,n=!1){if(Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=va,this._updateRange={offset:0,count:-1},this.updateRanges=[],this.gpuType=Sn,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}get updateRange(){return console.warn("THREE.BufferAttribute: updateRange() is deprecated and will be removed in r169. Use addUpdateRange() instead."),this._updateRange}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[t+s]=e.array[n+s];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)Zi.fromBufferAttribute(this,e),Zi.applyMatrix3(t),this.setXY(e,Zi.x,Zi.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)ae.fromBufferAttribute(this,e),ae.applyMatrix3(t),this.setXYZ(e,ae.x,ae.y,ae.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)ae.fromBufferAttribute(this,e),ae.applyMatrix4(t),this.setXYZ(e,ae.x,ae.y,ae.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)ae.fromBufferAttribute(this,e),ae.applyNormalMatrix(t),this.setXYZ(e,ae.x,ae.y,ae.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)ae.fromBufferAttribute(this,e),ae.transformDirection(t),this.setXYZ(e,ae.x,ae.y,ae.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];return this.normalized&&(n=yi(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=Ce(n,this.array)),this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=yi(e,this.array)),e}setX(t,e){return this.normalized&&(e=Ce(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=yi(e,this.array)),e}setY(t,e){return this.normalized&&(e=Ce(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=yi(e,this.array)),e}setZ(t,e){return this.normalized&&(e=Ce(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=yi(e,this.array)),e}setW(t,e){return this.normalized&&(e=Ce(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){return t*=this.itemSize,this.normalized&&(e=Ce(e,this.array),n=Ce(n,this.array)),this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,s){return t*=this.itemSize,this.normalized&&(e=Ce(e,this.array),n=Ce(n,this.array),s=Ce(s,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this}setXYZW(t,e,n,s,r){return t*=this.itemSize,this.normalized&&(e=Ce(e,this.array),n=Ce(n,this.array),s=Ce(s,this.array),r=Ce(r,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(t.name=this.name),this.usage!==va&&(t.usage=this.usage),t}}class Go extends Ae{constructor(t,e,n){super(new Uint16Array(t),e,n)}}class Vo extends Ae{constructor(t,e,n){super(new Uint32Array(t),e,n)}}class Fe extends Ae{constructor(t,e,n){super(new Float32Array(t),e,n)}}let bc=0;const Be=new re,tr=new we,Qn=new D,Ue=new Fi,bi=new Fi,ue=new D;class Ke extends vi{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:bc++}),this.uuid=Ni(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(Io(t)?Vo:Go)(t,1):this.index=t,this}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){const e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const r=new zt().getNormalMatrix(t);n.applyNormalMatrix(r),n.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(t),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(t){return Be.makeRotationFromQuaternion(t),this.applyMatrix4(Be),this}rotateX(t){return Be.makeRotationX(t),this.applyMatrix4(Be),this}rotateY(t){return Be.makeRotationY(t),this.applyMatrix4(Be),this}rotateZ(t){return Be.makeRotationZ(t),this.applyMatrix4(Be),this}translate(t,e,n){return Be.makeTranslation(t,e,n),this.applyMatrix4(Be),this}scale(t,e,n){return Be.makeScale(t,e,n),this.applyMatrix4(Be),this}lookAt(t){return tr.lookAt(t),tr.updateMatrix(),this.applyMatrix4(tr.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Qn).negate(),this.translate(Qn.x,Qn.y,Qn.z),this}setFromPoints(t){const e=[];for(let n=0,s=t.length;n<s;n++){const r=t[n];e.push(r.x,r.y,r.z||0)}return this.setAttribute("position",new Fe(e,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Fi);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error('THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box. Alternatively set "mesh.frustumCulled" to "false".',this),this.boundingBox.set(new D(-1/0,-1/0,-1/0),new D(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,s=e.length;n<s;n++){const r=e[n];Ue.setFromBufferAttribute(r),this.morphTargetsRelative?(ue.addVectors(this.boundingBox.min,Ue.min),this.boundingBox.expandByPoint(ue),ue.addVectors(this.boundingBox.max,Ue.max),this.boundingBox.expandByPoint(ue)):(this.boundingBox.expandByPoint(Ue.min),this.boundingBox.expandByPoint(Ue.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new bs);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error('THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere. Alternatively set "mesh.frustumCulled" to "false".',this),this.boundingSphere.set(new D,1/0);return}if(t){const n=this.boundingSphere.center;if(Ue.setFromBufferAttribute(t),e)for(let r=0,o=e.length;r<o;r++){const a=e[r];bi.setFromBufferAttribute(a),this.morphTargetsRelative?(ue.addVectors(Ue.min,bi.min),Ue.expandByPoint(ue),ue.addVectors(Ue.max,bi.max),Ue.expandByPoint(ue)):(Ue.expandByPoint(bi.min),Ue.expandByPoint(bi.max))}Ue.getCenter(n);let s=0;for(let r=0,o=t.count;r<o;r++)ue.fromBufferAttribute(t,r),s=Math.max(s,n.distanceToSquared(ue));if(e)for(let r=0,o=e.length;r<o;r++){const a=e[r],l=this.morphTargetsRelative;for(let c=0,h=a.count;c<h;c++)ue.fromBufferAttribute(a,c),l&&(Qn.fromBufferAttribute(t,c),ue.add(Qn)),s=Math.max(s,n.distanceToSquared(ue))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=t.array,s=e.position.array,r=e.normal.array,o=e.uv.array,a=s.length/3;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Ae(new Float32Array(4*a),4));const l=this.getAttribute("tangent").array,c=[],h=[];for(let E=0;E<a;E++)c[E]=new D,h[E]=new D;const d=new D,p=new D,m=new D,_=new kt,g=new kt,f=new kt,u=new D,T=new D;function y(E,V,W){d.fromArray(s,E*3),p.fromArray(s,V*3),m.fromArray(s,W*3),_.fromArray(o,E*2),g.fromArray(o,V*2),f.fromArray(o,W*2),p.sub(d),m.sub(d),g.sub(_),f.sub(_);const nt=1/(g.x*f.y-f.x*g.y);isFinite(nt)&&(u.copy(p).multiplyScalar(f.y).addScaledVector(m,-g.y).multiplyScalar(nt),T.copy(m).multiplyScalar(g.x).addScaledVector(p,-f.x).multiplyScalar(nt),c[E].add(u),c[V].add(u),c[W].add(u),h[E].add(T),h[V].add(T),h[W].add(T))}let A=this.groups;A.length===0&&(A=[{start:0,count:n.length}]);for(let E=0,V=A.length;E<V;++E){const W=A[E],nt=W.start,P=W.count;for(let H=nt,k=nt+P;H<k;H+=3)y(n[H+0],n[H+1],n[H+2])}const C=new D,b=new D,w=new D,$=new D;function M(E){w.fromArray(r,E*3),$.copy(w);const V=c[E];C.copy(V),C.sub(w.multiplyScalar(w.dot(V))).normalize(),b.crossVectors($,V);const nt=b.dot(h[E])<0?-1:1;l[E*4]=C.x,l[E*4+1]=C.y,l[E*4+2]=C.z,l[E*4+3]=nt}for(let E=0,V=A.length;E<V;++E){const W=A[E],nt=W.start,P=W.count;for(let H=nt,k=nt+P;H<k;H+=3)M(n[H+0]),M(n[H+1]),M(n[H+2])}}computeVertexNormals(){const t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new Ae(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let p=0,m=n.count;p<m;p++)n.setXYZ(p,0,0,0);const s=new D,r=new D,o=new D,a=new D,l=new D,c=new D,h=new D,d=new D;if(t)for(let p=0,m=t.count;p<m;p+=3){const _=t.getX(p+0),g=t.getX(p+1),f=t.getX(p+2);s.fromBufferAttribute(e,_),r.fromBufferAttribute(e,g),o.fromBufferAttribute(e,f),h.subVectors(o,r),d.subVectors(s,r),h.cross(d),a.fromBufferAttribute(n,_),l.fromBufferAttribute(n,g),c.fromBufferAttribute(n,f),a.add(h),l.add(h),c.add(h),n.setXYZ(_,a.x,a.y,a.z),n.setXYZ(g,l.x,l.y,l.z),n.setXYZ(f,c.x,c.y,c.z)}else for(let p=0,m=e.count;p<m;p+=3)s.fromBufferAttribute(e,p+0),r.fromBufferAttribute(e,p+1),o.fromBufferAttribute(e,p+2),h.subVectors(o,r),d.subVectors(s,r),h.cross(d),n.setXYZ(p+0,h.x,h.y,h.z),n.setXYZ(p+1,h.x,h.y,h.z),n.setXYZ(p+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)ue.fromBufferAttribute(t,e),ue.normalize(),t.setXYZ(e,ue.x,ue.y,ue.z)}toNonIndexed(){function t(a,l){const c=a.array,h=a.itemSize,d=a.normalized,p=new c.constructor(l.length*h);let m=0,_=0;for(let g=0,f=l.length;g<f;g++){a.isInterleavedBufferAttribute?m=l[g]*a.data.stride+a.offset:m=l[g]*h;for(let u=0;u<h;u++)p[_++]=c[m++]}return new Ae(p,h,d)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const e=new Ke,n=this.index.array,s=this.attributes;for(const a in s){const l=s[a],c=t(l,n);e.setAttribute(a,c)}const r=this.morphAttributes;for(const a in r){const l=[],c=r[a];for(let h=0,d=c.length;h<d;h++){const p=c[h],m=t(p,n);l.push(m)}e.morphAttributes[a]=l}e.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let a=0,l=o.length;a<l;a++){const c=o[a];e.addGroup(c.start,c.count,c.materialIndex)}return e}toJSON(){const t={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.type,this.name!==""&&(t.name=this.name),Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};const e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});const n=this.attributes;for(const l in n){const c=n[l];t.data.attributes[l]=c.toJSON(t.data)}const s={};let r=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],h=[];for(let d=0,p=c.length;d<p;d++){const m=c[d];h.push(m.toJSON(t.data))}h.length>0&&(s[l]=h,r=!0)}r&&(t.data.morphAttributes=s,t.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(t.data.groups=JSON.parse(JSON.stringify(o)));const a=this.boundingSphere;return a!==null&&(t.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const e={};this.name=t.name;const n=t.index;n!==null&&this.setIndex(n.clone(e));const s=t.attributes;for(const c in s){const h=s[c];this.setAttribute(c,h.clone(e))}const r=t.morphAttributes;for(const c in r){const h=[],d=r[c];for(let p=0,m=d.length;p<m;p++)h.push(d[p].clone(e));this.morphAttributes[c]=h}this.morphTargetsRelative=t.morphTargetsRelative;const o=t.groups;for(let c=0,h=o.length;c<h;c++){const d=o[c];this.addGroup(d.start,d.count,d.materialIndex)}const a=t.boundingBox;a!==null&&(this.boundingBox=a.clone());const l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const Da=new re,Ln=new Bo,Ji=new bs,Ia=new D,ti=new D,ei=new D,ni=new D,er=new D,Qi=new D,ts=new kt,es=new kt,ns=new kt,Ua=new D,Na=new D,Fa=new D,is=new D,ss=new D;class $e extends we{constructor(t=new Ke,e=new Li){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(t,e){const n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,o=n.morphTargetsRelative;e.fromBufferAttribute(s,t);const a=this.morphTargetInfluences;if(r&&a){Qi.set(0,0,0);for(let l=0,c=r.length;l<c;l++){const h=a[l],d=r[l];h!==0&&(er.fromBufferAttribute(d,t),o?Qi.addScaledVector(er,h):Qi.addScaledVector(er.sub(e),h))}e.add(Qi)}return e}raycast(t,e){const n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Ji.copy(n.boundingSphere),Ji.applyMatrix4(r),Ln.copy(t.ray).recast(t.near),!(Ji.containsPoint(Ln.origin)===!1&&(Ln.intersectSphere(Ji,Ia)===null||Ln.origin.distanceToSquared(Ia)>(t.far-t.near)**2))&&(Da.copy(r).invert(),Ln.copy(t.ray).applyMatrix4(Da),!(n.boundingBox!==null&&Ln.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(t,e,Ln)))}_computeIntersections(t,e,n){let s;const r=this.geometry,o=this.material,a=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,d=r.attributes.normal,p=r.groups,m=r.drawRange;if(a!==null)if(Array.isArray(o))for(let _=0,g=p.length;_<g;_++){const f=p[_],u=o[f.materialIndex],T=Math.max(f.start,m.start),y=Math.min(a.count,Math.min(f.start+f.count,m.start+m.count));for(let A=T,C=y;A<C;A+=3){const b=a.getX(A),w=a.getX(A+1),$=a.getX(A+2);s=rs(this,u,t,n,c,h,d,b,w,$),s&&(s.faceIndex=Math.floor(A/3),s.face.materialIndex=f.materialIndex,e.push(s))}}else{const _=Math.max(0,m.start),g=Math.min(a.count,m.start+m.count);for(let f=_,u=g;f<u;f+=3){const T=a.getX(f),y=a.getX(f+1),A=a.getX(f+2);s=rs(this,o,t,n,c,h,d,T,y,A),s&&(s.faceIndex=Math.floor(f/3),e.push(s))}}else if(l!==void 0)if(Array.isArray(o))for(let _=0,g=p.length;_<g;_++){const f=p[_],u=o[f.materialIndex],T=Math.max(f.start,m.start),y=Math.min(l.count,Math.min(f.start+f.count,m.start+m.count));for(let A=T,C=y;A<C;A+=3){const b=A,w=A+1,$=A+2;s=rs(this,u,t,n,c,h,d,b,w,$),s&&(s.faceIndex=Math.floor(A/3),s.face.materialIndex=f.materialIndex,e.push(s))}}else{const _=Math.max(0,m.start),g=Math.min(l.count,m.start+m.count);for(let f=_,u=g;f<u;f+=3){const T=f,y=f+1,A=f+2;s=rs(this,o,t,n,c,h,d,T,y,A),s&&(s.faceIndex=Math.floor(f/3),e.push(s))}}}}function wc(i,t,e,n,s,r,o,a){let l;if(t.side===be?l=n.intersectTriangle(o,r,s,!0,a):l=n.intersectTriangle(s,r,o,t.side===bn,a),l===null)return null;ss.copy(a),ss.applyMatrix4(i.matrixWorld);const c=e.ray.origin.distanceTo(ss);return c<e.near||c>e.far?null:{distance:c,point:ss.clone(),object:i}}function rs(i,t,e,n,s,r,o,a,l,c){i.getVertexPosition(a,ti),i.getVertexPosition(l,ei),i.getVertexPosition(c,ni);const h=wc(i,t,e,n,ti,ei,ni,is);if(h){s&&(ts.fromBufferAttribute(s,a),es.fromBufferAttribute(s,l),ns.fromBufferAttribute(s,c),h.uv=qe.getInterpolation(is,ti,ei,ni,ts,es,ns,new kt)),r&&(ts.fromBufferAttribute(r,a),es.fromBufferAttribute(r,l),ns.fromBufferAttribute(r,c),h.uv1=qe.getInterpolation(is,ti,ei,ni,ts,es,ns,new kt),h.uv2=h.uv1),o&&(Ua.fromBufferAttribute(o,a),Na.fromBufferAttribute(o,l),Fa.fromBufferAttribute(o,c),h.normal=qe.getInterpolation(is,ti,ei,ni,Ua,Na,Fa,new D),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));const d={a,b:l,c,normal:new D,materialIndex:0};qe.getNormal(ti,ei,ni,d.normal),h.face=d}return h}class Bi extends Ke{constructor(t=1,e=1,n=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:s,heightSegments:r,depthSegments:o};const a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);const l=[],c=[],h=[],d=[];let p=0,m=0;_("z","y","x",-1,-1,n,e,t,o,r,0),_("z","y","x",1,-1,n,e,-t,o,r,1),_("x","z","y",1,1,t,n,e,s,o,2),_("x","z","y",1,-1,t,n,-e,s,o,3),_("x","y","z",1,-1,t,e,n,s,r,4),_("x","y","z",-1,-1,t,e,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new Fe(c,3)),this.setAttribute("normal",new Fe(h,3)),this.setAttribute("uv",new Fe(d,2));function _(g,f,u,T,y,A,C,b,w,$,M){const E=A/w,V=C/$,W=A/2,nt=C/2,P=b/2,H=w+1,k=$+1;let Y=0,X=0;const q=new D;for(let j=0;j<k;j++){const et=j*V-nt;for(let it=0;it<H;it++){const G=it*E-W;q[g]=G*T,q[f]=et*y,q[u]=P,c.push(q.x,q.y,q.z),q[g]=0,q[f]=0,q[u]=b>0?1:-1,h.push(q.x,q.y,q.z),d.push(it/w),d.push(1-j/$),Y+=1}}for(let j=0;j<$;j++)for(let et=0;et<w;et++){const it=p+et+H*j,G=p+et+H*(j+1),K=p+(et+1)+H*(j+1),ct=p+(et+1)+H*j;l.push(it,G,ct),l.push(G,K,ct),X+=6}a.addGroup(m,X,M),m+=X,p+=Y}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Bi(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}}function mi(i){const t={};for(const e in i){t[e]={};for(const n in i[e]){const s=i[e][n];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][n]=null):t[e][n]=s.clone():Array.isArray(s)?t[e][n]=s.slice():t[e][n]=s}}return t}function Ee(i){const t={};for(let e=0;e<i.length;e++){const n=mi(i[e]);for(const s in n)t[s]=n[s]}return t}function Rc(i){const t=[];for(let e=0;e<i.length;e++)t.push(i[e].clone());return t}function ko(i){return i.getRenderTarget()===null?i.outputColorSpace:Yt.workingColorSpace}const Cc={clone:mi,merge:Ee};var Pc=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Lc=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class fn extends un{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Pc,this.fragmentShader=Lc,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={derivatives:!1,fragDepth:!1,drawBuffers:!1,shaderTextureLOD:!1,clipCullDistance:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=mi(t.uniforms),this.uniformsGroups=Rc(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this}toJSON(t){const e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(const s in this.uniforms){const o=this.uniforms[s].value;o&&o.isTexture?e.uniforms[s]={type:"t",value:o.toJSON(t).uuid}:o&&o.isColor?e.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?e.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?e.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?e.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?e.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?e.uniforms[s]={type:"m4",value:o.toArray()}:e.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;const n={};for(const s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(e.extensions=n),e}}class Wo extends we{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new re,this.projectionMatrix=new re,this.projectionMatrixInverse=new re,this.coordinateSystem=cn}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(t,e){super.updateWorldMatrix(t,e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}class Ne extends Wo{constructor(t=50,e=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){const e=.5*this.getFilmHeight()/t;this.fov=xr*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){const t=Math.tan(Bs*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return xr*2*Math.atan(Math.tan(Bs*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}setViewOffset(t,e,n,s,r,o){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=this.near;let e=t*Math.tan(Bs*.5*this.fov)/this.zoom,n=2*e,s=this.aspect*n,r=-.5*s;const o=this.view;if(this.view!==null&&this.view.enabled){const l=o.fullWidth,c=o.fullHeight;r+=o.offsetX*s/l,e-=o.offsetY*n/c,s*=o.width/l,n*=o.height/c}const a=this.filmOffset;a!==0&&(r+=t*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,e,e-n,t,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}}const ii=-90,si=1;class Dc extends we{constructor(t,e,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new Ne(ii,si,t,e);s.layers=this.layers,this.add(s);const r=new Ne(ii,si,t,e);r.layers=this.layers,this.add(r);const o=new Ne(ii,si,t,e);o.layers=this.layers,this.add(o);const a=new Ne(ii,si,t,e);a.layers=this.layers,this.add(a);const l=new Ne(ii,si,t,e);l.layers=this.layers,this.add(l);const c=new Ne(ii,si,t,e);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const t=this.coordinateSystem,e=this.children.concat(),[n,s,r,o,a,l]=e;for(const c of e)this.remove(c);if(t===cn)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===xs)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(const c of e)this.add(c),c.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());const[r,o,a,l,c,h]=this.children,d=t.getRenderTarget(),p=t.getActiveCubeFace(),m=t.getActiveMipmapLevel(),_=t.xr.enabled;t.xr.enabled=!1;const g=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,t.setRenderTarget(n,0,s),t.render(e,r),t.setRenderTarget(n,1,s),t.render(e,o),t.setRenderTarget(n,2,s),t.render(e,a),t.setRenderTarget(n,3,s),t.render(e,l),t.setRenderTarget(n,4,s),t.render(e,c),n.texture.generateMipmaps=g,t.setRenderTarget(n,5,s),t.render(e,h),t.setRenderTarget(d,p,m),t.xr.enabled=_,n.texture.needsPMREMUpdate=!0}}class Xo extends Le{constructor(t,e,n,s,r,o,a,l,c,h){t=t!==void 0?t:[],e=e!==void 0?e:di,super(t,e,n,s,r,o,a,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}}class Ic extends Hn{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;const n={width:t,height:t,depth:1},s=[n,n,n,n,n,n];e.encoding!==void 0&&(Pi("THREE.WebGLCubeRenderTarget: option.encoding has been replaced by option.colorSpace."),e.colorSpace=e.encoding===zn?fe:Ge),this.texture=new Xo(s,e.mapping,e.wrapS,e.wrapT,e.magFilter,e.minFilter,e.format,e.type,e.anisotropy,e.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=e.generateMipmaps!==void 0?e.generateMipmaps:!1,this.texture.minFilter=e.minFilter!==void 0?e.minFilter:ze}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new Bi(5,5,5),r=new fn({name:"CubemapFromEquirect",uniforms:mi(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:be,blending:En});r.uniforms.tEquirect.value=e;const o=new $e(s,r),a=e.minFilter;return e.minFilter===Di&&(e.minFilter=ze),new Dc(1,10,this).update(t,o),e.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(t,e,n,s){const r=t.getRenderTarget();for(let o=0;o<6;o++)t.setRenderTarget(this,o),t.clear(e,n,s);t.setRenderTarget(r)}}const nr=new D,Uc=new D,Nc=new zt;class In{constructor(t=new D(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,s){return this.normal.set(t,e,n),this.constant=s,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){const s=nr.subVectors(n,e).cross(Uc.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(s,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){const t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e){const n=t.delta(nr),s=this.normal.dot(n);if(s===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;const r=-(t.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:e.copy(t.start).addScaledVector(n,r)}intersectsLine(t){const e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){const n=e||Nc.getNormalMatrix(t),s=this.coplanarPoint(nr).applyMatrix4(t),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}}const Dn=new bs,as=new D;class Rr{constructor(t=new In,e=new In,n=new In,s=new In,r=new In,o=new In){this.planes=[t,e,n,s,r,o]}set(t,e,n,s,r,o){const a=this.planes;return a[0].copy(t),a[1].copy(e),a[2].copy(n),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(t){const e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t,e=cn){const n=this.planes,s=t.elements,r=s[0],o=s[1],a=s[2],l=s[3],c=s[4],h=s[5],d=s[6],p=s[7],m=s[8],_=s[9],g=s[10],f=s[11],u=s[12],T=s[13],y=s[14],A=s[15];if(n[0].setComponents(l-r,p-c,f-m,A-u).normalize(),n[1].setComponents(l+r,p+c,f+m,A+u).normalize(),n[2].setComponents(l+o,p+h,f+_,A+T).normalize(),n[3].setComponents(l-o,p-h,f-_,A-T).normalize(),n[4].setComponents(l-a,p-d,f-g,A-y).normalize(),e===cn)n[5].setComponents(l+a,p+d,f+g,A+y).normalize();else if(e===xs)n[5].setComponents(a,d,g,y).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),Dn.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{const e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),Dn.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(Dn)}intersectsSprite(t){return Dn.center.set(0,0,0),Dn.radius=.7071067811865476,Dn.applyMatrix4(t.matrixWorld),this.intersectsSphere(Dn)}intersectsSphere(t){const e=this.planes,n=t.center,s=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(t){const e=this.planes;for(let n=0;n<6;n++){const s=e[n];if(as.x=s.normal.x>0?t.max.x:t.min.x,as.y=s.normal.y>0?t.max.y:t.min.y,as.z=s.normal.z>0?t.max.z:t.min.z,s.distanceToPoint(as)<0)return!1}return!0}containsPoint(t){const e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function qo(){let i=null,t=!1,e=null,n=null;function s(r,o){e(r,o),n=i.requestAnimationFrame(s)}return{start:function(){t!==!0&&e!==null&&(n=i.requestAnimationFrame(s),t=!0)},stop:function(){i.cancelAnimationFrame(n),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){i=r}}}function Fc(i,t){const e=t.isWebGL2,n=new WeakMap;function s(c,h){const d=c.array,p=c.usage,m=d.byteLength,_=i.createBuffer();i.bindBuffer(h,_),i.bufferData(h,d,p),c.onUploadCallback();let g;if(d instanceof Float32Array)g=i.FLOAT;else if(d instanceof Uint16Array)if(c.isFloat16BufferAttribute)if(e)g=i.HALF_FLOAT;else throw new Error("THREE.WebGLAttributes: Usage of Float16BufferAttribute requires WebGL2.");else g=i.UNSIGNED_SHORT;else if(d instanceof Int16Array)g=i.SHORT;else if(d instanceof Uint32Array)g=i.UNSIGNED_INT;else if(d instanceof Int32Array)g=i.INT;else if(d instanceof Int8Array)g=i.BYTE;else if(d instanceof Uint8Array)g=i.UNSIGNED_BYTE;else if(d instanceof Uint8ClampedArray)g=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+d);return{buffer:_,type:g,bytesPerElement:d.BYTES_PER_ELEMENT,version:c.version,size:m}}function r(c,h,d){const p=h.array,m=h._updateRange,_=h.updateRanges;if(i.bindBuffer(d,c),m.count===-1&&_.length===0&&i.bufferSubData(d,0,p),_.length!==0){for(let g=0,f=_.length;g<f;g++){const u=_[g];e?i.bufferSubData(d,u.start*p.BYTES_PER_ELEMENT,p,u.start,u.count):i.bufferSubData(d,u.start*p.BYTES_PER_ELEMENT,p.subarray(u.start,u.start+u.count))}h.clearUpdateRanges()}m.count!==-1&&(e?i.bufferSubData(d,m.offset*p.BYTES_PER_ELEMENT,p,m.offset,m.count):i.bufferSubData(d,m.offset*p.BYTES_PER_ELEMENT,p.subarray(m.offset,m.offset+m.count)),m.count=-1),h.onUploadCallback()}function o(c){return c.isInterleavedBufferAttribute&&(c=c.data),n.get(c)}function a(c){c.isInterleavedBufferAttribute&&(c=c.data);const h=n.get(c);h&&(i.deleteBuffer(h.buffer),n.delete(c))}function l(c,h){if(c.isGLBufferAttribute){const p=n.get(c);(!p||p.version<c.version)&&n.set(c,{buffer:c.buffer,type:c.type,bytesPerElement:c.elementSize,version:c.version});return}c.isInterleavedBufferAttribute&&(c=c.data);const d=n.get(c);if(d===void 0)n.set(c,s(c,h));else if(d.version<c.version){if(d.size!==c.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");r(d.buffer,c,h),d.version=c.version}}return{get:o,remove:a,update:l}}class Cr extends Ke{constructor(t=1,e=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:s};const r=t/2,o=e/2,a=Math.floor(n),l=Math.floor(s),c=a+1,h=l+1,d=t/a,p=e/l,m=[],_=[],g=[],f=[];for(let u=0;u<h;u++){const T=u*p-o;for(let y=0;y<c;y++){const A=y*d-r;_.push(A,-T,0),g.push(0,0,1),f.push(y/a),f.push(1-u/l)}}for(let u=0;u<l;u++)for(let T=0;T<a;T++){const y=T+c*u,A=T+c*(u+1),C=T+1+c*(u+1),b=T+1+c*u;m.push(y,A,b),m.push(A,C,b)}this.setIndex(m),this.setAttribute("position",new Fe(_,3)),this.setAttribute("normal",new Fe(g,3)),this.setAttribute("uv",new Fe(f,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Cr(t.width,t.height,t.widthSegments,t.heightSegments)}}var Oc=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Bc=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,zc=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Hc=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Gc=`#ifdef USE_ALPHATEST
	if ( diffuseColor.a < alphaTest ) discard;
#endif`,Vc=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,kc=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Wc=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Xc=`#ifdef USE_BATCHING
	attribute float batchId;
	uniform highp sampler2D batchingTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,qc=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( batchId );
#endif`,Yc=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,$c=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,jc=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Kc=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Zc=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Jc=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#pragma unroll_loop_start
	for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
		plane = clippingPlanes[ i ];
		if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
	}
	#pragma unroll_loop_end
	#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
		bool clipped = true;
		#pragma unroll_loop_start
		for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
		}
		#pragma unroll_loop_end
		if ( clipped ) discard;
	#endif
#endif`,Qc=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,th=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,eh=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,nh=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,ih=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,sh=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	varying vec3 vColor;
#endif`,rh=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif`,ah=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
float luminance( const in vec3 rgb ) {
	const vec3 weights = vec3( 0.2126729, 0.7151522, 0.0721750 );
	return dot( weights, rgb );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,oh=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,lh=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,ch=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,hh=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,uh=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,dh=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,fh="gl_FragColor = linearToOutputTexel( gl_FragColor );",ph=`
const mat3 LINEAR_SRGB_TO_LINEAR_DISPLAY_P3 = mat3(
	vec3( 0.8224621, 0.177538, 0.0 ),
	vec3( 0.0331941, 0.9668058, 0.0 ),
	vec3( 0.0170827, 0.0723974, 0.9105199 )
);
const mat3 LINEAR_DISPLAY_P3_TO_LINEAR_SRGB = mat3(
	vec3( 1.2249401, - 0.2249404, 0.0 ),
	vec3( - 0.0420569, 1.0420571, 0.0 ),
	vec3( - 0.0196376, - 0.0786361, 1.0982735 )
);
vec4 LinearSRGBToLinearDisplayP3( in vec4 value ) {
	return vec4( value.rgb * LINEAR_SRGB_TO_LINEAR_DISPLAY_P3, value.a );
}
vec4 LinearDisplayP3ToLinearSRGB( in vec4 value ) {
	return vec4( value.rgb * LINEAR_DISPLAY_P3_TO_LINEAR_SRGB, value.a );
}
vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}
vec4 LinearToLinear( in vec4 value ) {
	return value;
}
vec4 LinearTosRGB( in vec4 value ) {
	return sRGBTransferOETF( value );
}`,mh=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,gh=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,_h=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,vh=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,xh=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,Mh=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Sh=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,yh=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Eh=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Th=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Ah=`#ifdef USE_LIGHTMAP
	vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
	vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
	reflectedLight.indirectDiffuse += lightMapIrradiance;
#endif`,bh=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,wh=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Rh=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Ch=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	#if defined ( LEGACY_LIGHTS )
		if ( cutoffDistance > 0.0 && decayExponent > 0.0 ) {
			return pow( saturate( - lightDistance / cutoffDistance + 1.0 ), decayExponent );
		}
		return 1.0;
	#else
		float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
		if ( cutoffDistance > 0.0 ) {
			distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
		}
		return distanceFalloff;
	#endif
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,Ph=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,Lh=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Dh=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Ih=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Uh=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Nh=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Fh=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Oh=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Bh=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,zh=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Hh=`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	gl_FragDepthEXT = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Gh=`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Vh=`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		varying float vFragDepth;
		varying float vIsPerspective;
	#else
		uniform float logDepthBufFC;
	#endif
#endif`,kh=`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		vFragDepth = 1.0 + gl_Position.w;
		vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
	#else
		if ( isPerspectiveMatrix( projectionMatrix ) ) {
			gl_Position.z = log2( max( EPSILON, gl_Position.w + 1.0 ) ) * logDepthBufFC - 1.0;
			gl_Position.z *= gl_Position.w;
		}
	#endif
#endif`,Wh=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Xh=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,qh=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Yh=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,$h=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,jh=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Kh=`#if defined( USE_MORPHCOLORS ) && defined( MORPHTARGETS_TEXTURE )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Zh=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
			if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
		}
	#else
		objectNormal += morphNormal0 * morphTargetInfluences[ 0 ];
		objectNormal += morphNormal1 * morphTargetInfluences[ 1 ];
		objectNormal += morphNormal2 * morphTargetInfluences[ 2 ];
		objectNormal += morphNormal3 * morphTargetInfluences[ 3 ];
	#endif
#endif`,Jh=`#ifdef USE_MORPHTARGETS
	uniform float morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
		uniform sampler2DArray morphTargetsTexture;
		uniform ivec2 morphTargetsTextureSize;
		vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
			int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
			int y = texelIndex / morphTargetsTextureSize.x;
			int x = texelIndex - y * morphTargetsTextureSize.x;
			ivec3 morphUV = ivec3( x, y, morphTargetIndex );
			return texelFetch( morphTargetsTexture, morphUV, 0 );
		}
	#else
		#ifndef USE_MORPHNORMALS
			uniform float morphTargetInfluences[ 8 ];
		#else
			uniform float morphTargetInfluences[ 4 ];
		#endif
	#endif
#endif`,Qh=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
			if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
		}
	#else
		transformed += morphTarget0 * morphTargetInfluences[ 0 ];
		transformed += morphTarget1 * morphTargetInfluences[ 1 ];
		transformed += morphTarget2 * morphTargetInfluences[ 2 ];
		transformed += morphTarget3 * morphTargetInfluences[ 3 ];
		#ifndef USE_MORPHNORMALS
			transformed += morphTarget4 * morphTargetInfluences[ 4 ];
			transformed += morphTarget5 * morphTargetInfluences[ 5 ];
			transformed += morphTarget6 * morphTargetInfluences[ 6 ];
			transformed += morphTarget7 * morphTargetInfluences[ 7 ];
		#endif
	#endif
#endif`,tu=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,eu=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,nu=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,iu=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,su=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,ru=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,au=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,ou=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,lu=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,cu=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,hu=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,uu=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;
const vec3 PackFactors = vec3( 256. * 256. * 256., 256. * 256., 256. );
const vec4 UnpackFactors = UnpackDownscale / vec4( PackFactors, 1. );
const float ShiftRight8 = 1. / 256.;
vec4 packDepthToRGBA( const in float v ) {
	vec4 r = vec4( fract( v * PackFactors ), v );
	r.yzw -= r.xyz * ShiftRight8;	return r * PackUpscale;
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors );
}
vec2 packDepthToRG( in highp float v ) {
	return packDepthToRGBA( v ).yx;
}
float unpackRGToDepth( const in highp vec2 v ) {
	return unpackRGBAToDepth( vec4( v.xy, 0.0, 0.0 ) );
}
vec4 pack2HalfToRGBA( vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,du=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,fu=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,pu=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,mu=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,gu=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,_u=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,vu=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return shadow;
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
		vec3 lightToPosition = shadowCoord.xyz;
		float dp = ( length( lightToPosition ) - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );		dp += shadowBias;
		vec3 bd3D = normalize( lightToPosition );
		#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
			vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
			return (
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
			) * ( 1.0 / 9.0 );
		#else
			return texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
		#endif
	}
#endif`,xu=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,Mu=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,Su=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,yu=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Eu=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,Tu=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Au=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,bu=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,wu=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Ru=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Cu=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 OptimizedCineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color *= toneMappingExposure;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	return color;
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,Pu=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,Lu=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
		vec3 refractedRayExit = position + transmissionRay;
		vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
		vec2 refractionCoords = ndcPos.xy / ndcPos.w;
		refractionCoords += 1.0;
		refractionCoords /= 2.0;
		vec4 transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
		vec3 transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,Du=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Iu=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Uu=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,Nu=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const Fu=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Ou=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Bu=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,zu=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Hu=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Gu=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Vu=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,ku=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( 1.0 );
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#endif
}`,Wu=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,Xu=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( 1.0 );
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,qu=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Yu=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,$u=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,ju=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Ku=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,Zu=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Ju=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Qu=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,td=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,ed=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,nd=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,id=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), opacity );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,sd=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,rd=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,ad=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,od=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,ld=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,cd=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,hd=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,ud=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,dd=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,fd=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,pd=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );
	vec2 scale;
	scale.x = length( vec3( modelMatrix[ 0 ].x, modelMatrix[ 0 ].y, modelMatrix[ 0 ].z ) );
	scale.y = length( vec3( modelMatrix[ 1 ].x, modelMatrix[ 1 ].y, modelMatrix[ 1 ].z ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,md=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,It={alphahash_fragment:Oc,alphahash_pars_fragment:Bc,alphamap_fragment:zc,alphamap_pars_fragment:Hc,alphatest_fragment:Gc,alphatest_pars_fragment:Vc,aomap_fragment:kc,aomap_pars_fragment:Wc,batching_pars_vertex:Xc,batching_vertex:qc,begin_vertex:Yc,beginnormal_vertex:$c,bsdfs:jc,iridescence_fragment:Kc,bumpmap_pars_fragment:Zc,clipping_planes_fragment:Jc,clipping_planes_pars_fragment:Qc,clipping_planes_pars_vertex:th,clipping_planes_vertex:eh,color_fragment:nh,color_pars_fragment:ih,color_pars_vertex:sh,color_vertex:rh,common:ah,cube_uv_reflection_fragment:oh,defaultnormal_vertex:lh,displacementmap_pars_vertex:ch,displacementmap_vertex:hh,emissivemap_fragment:uh,emissivemap_pars_fragment:dh,colorspace_fragment:fh,colorspace_pars_fragment:ph,envmap_fragment:mh,envmap_common_pars_fragment:gh,envmap_pars_fragment:_h,envmap_pars_vertex:vh,envmap_physical_pars_fragment:Ph,envmap_vertex:xh,fog_vertex:Mh,fog_pars_vertex:Sh,fog_fragment:yh,fog_pars_fragment:Eh,gradientmap_pars_fragment:Th,lightmap_fragment:Ah,lightmap_pars_fragment:bh,lights_lambert_fragment:wh,lights_lambert_pars_fragment:Rh,lights_pars_begin:Ch,lights_toon_fragment:Lh,lights_toon_pars_fragment:Dh,lights_phong_fragment:Ih,lights_phong_pars_fragment:Uh,lights_physical_fragment:Nh,lights_physical_pars_fragment:Fh,lights_fragment_begin:Oh,lights_fragment_maps:Bh,lights_fragment_end:zh,logdepthbuf_fragment:Hh,logdepthbuf_pars_fragment:Gh,logdepthbuf_pars_vertex:Vh,logdepthbuf_vertex:kh,map_fragment:Wh,map_pars_fragment:Xh,map_particle_fragment:qh,map_particle_pars_fragment:Yh,metalnessmap_fragment:$h,metalnessmap_pars_fragment:jh,morphcolor_vertex:Kh,morphnormal_vertex:Zh,morphtarget_pars_vertex:Jh,morphtarget_vertex:Qh,normal_fragment_begin:tu,normal_fragment_maps:eu,normal_pars_fragment:nu,normal_pars_vertex:iu,normal_vertex:su,normalmap_pars_fragment:ru,clearcoat_normal_fragment_begin:au,clearcoat_normal_fragment_maps:ou,clearcoat_pars_fragment:lu,iridescence_pars_fragment:cu,opaque_fragment:hu,packing:uu,premultiplied_alpha_fragment:du,project_vertex:fu,dithering_fragment:pu,dithering_pars_fragment:mu,roughnessmap_fragment:gu,roughnessmap_pars_fragment:_u,shadowmap_pars_fragment:vu,shadowmap_pars_vertex:xu,shadowmap_vertex:Mu,shadowmask_pars_fragment:Su,skinbase_vertex:yu,skinning_pars_vertex:Eu,skinning_vertex:Tu,skinnormal_vertex:Au,specularmap_fragment:bu,specularmap_pars_fragment:wu,tonemapping_fragment:Ru,tonemapping_pars_fragment:Cu,transmission_fragment:Pu,transmission_pars_fragment:Lu,uv_pars_fragment:Du,uv_pars_vertex:Iu,uv_vertex:Uu,worldpos_vertex:Nu,background_vert:Fu,background_frag:Ou,backgroundCube_vert:Bu,backgroundCube_frag:zu,cube_vert:Hu,cube_frag:Gu,depth_vert:Vu,depth_frag:ku,distanceRGBA_vert:Wu,distanceRGBA_frag:Xu,equirect_vert:qu,equirect_frag:Yu,linedashed_vert:$u,linedashed_frag:ju,meshbasic_vert:Ku,meshbasic_frag:Zu,meshlambert_vert:Ju,meshlambert_frag:Qu,meshmatcap_vert:td,meshmatcap_frag:ed,meshnormal_vert:nd,meshnormal_frag:id,meshphong_vert:sd,meshphong_frag:rd,meshphysical_vert:ad,meshphysical_frag:od,meshtoon_vert:ld,meshtoon_frag:cd,points_vert:hd,points_frag:ud,shadow_vert:dd,shadow_frag:fd,sprite_vert:pd,sprite_frag:md},rt={common:{diffuse:{value:new Gt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new zt},alphaMap:{value:null},alphaMapTransform:{value:new zt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new zt}},envmap:{envMap:{value:null},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new zt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new zt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new zt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new zt},normalScale:{value:new kt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new zt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new zt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new zt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new zt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Gt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Gt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new zt},alphaTest:{value:0},uvTransform:{value:new zt}},sprite:{diffuse:{value:new Gt(16777215)},opacity:{value:1},center:{value:new kt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new zt},alphaMap:{value:null},alphaMapTransform:{value:new zt},alphaTest:{value:0}}},Qe={basic:{uniforms:Ee([rt.common,rt.specularmap,rt.envmap,rt.aomap,rt.lightmap,rt.fog]),vertexShader:It.meshbasic_vert,fragmentShader:It.meshbasic_frag},lambert:{uniforms:Ee([rt.common,rt.specularmap,rt.envmap,rt.aomap,rt.lightmap,rt.emissivemap,rt.bumpmap,rt.normalmap,rt.displacementmap,rt.fog,rt.lights,{emissive:{value:new Gt(0)}}]),vertexShader:It.meshlambert_vert,fragmentShader:It.meshlambert_frag},phong:{uniforms:Ee([rt.common,rt.specularmap,rt.envmap,rt.aomap,rt.lightmap,rt.emissivemap,rt.bumpmap,rt.normalmap,rt.displacementmap,rt.fog,rt.lights,{emissive:{value:new Gt(0)},specular:{value:new Gt(1118481)},shininess:{value:30}}]),vertexShader:It.meshphong_vert,fragmentShader:It.meshphong_frag},standard:{uniforms:Ee([rt.common,rt.envmap,rt.aomap,rt.lightmap,rt.emissivemap,rt.bumpmap,rt.normalmap,rt.displacementmap,rt.roughnessmap,rt.metalnessmap,rt.fog,rt.lights,{emissive:{value:new Gt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:It.meshphysical_vert,fragmentShader:It.meshphysical_frag},toon:{uniforms:Ee([rt.common,rt.aomap,rt.lightmap,rt.emissivemap,rt.bumpmap,rt.normalmap,rt.displacementmap,rt.gradientmap,rt.fog,rt.lights,{emissive:{value:new Gt(0)}}]),vertexShader:It.meshtoon_vert,fragmentShader:It.meshtoon_frag},matcap:{uniforms:Ee([rt.common,rt.bumpmap,rt.normalmap,rt.displacementmap,rt.fog,{matcap:{value:null}}]),vertexShader:It.meshmatcap_vert,fragmentShader:It.meshmatcap_frag},points:{uniforms:Ee([rt.points,rt.fog]),vertexShader:It.points_vert,fragmentShader:It.points_frag},dashed:{uniforms:Ee([rt.common,rt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:It.linedashed_vert,fragmentShader:It.linedashed_frag},depth:{uniforms:Ee([rt.common,rt.displacementmap]),vertexShader:It.depth_vert,fragmentShader:It.depth_frag},normal:{uniforms:Ee([rt.common,rt.bumpmap,rt.normalmap,rt.displacementmap,{opacity:{value:1}}]),vertexShader:It.meshnormal_vert,fragmentShader:It.meshnormal_frag},sprite:{uniforms:Ee([rt.sprite,rt.fog]),vertexShader:It.sprite_vert,fragmentShader:It.sprite_frag},background:{uniforms:{uvTransform:{value:new zt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:It.background_vert,fragmentShader:It.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1}},vertexShader:It.backgroundCube_vert,fragmentShader:It.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:It.cube_vert,fragmentShader:It.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:It.equirect_vert,fragmentShader:It.equirect_frag},distanceRGBA:{uniforms:Ee([rt.common,rt.displacementmap,{referencePosition:{value:new D},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:It.distanceRGBA_vert,fragmentShader:It.distanceRGBA_frag},shadow:{uniforms:Ee([rt.lights,rt.fog,{color:{value:new Gt(0)},opacity:{value:1}}]),vertexShader:It.shadow_vert,fragmentShader:It.shadow_frag}};Qe.physical={uniforms:Ee([Qe.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new zt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new zt},clearcoatNormalScale:{value:new kt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new zt},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new zt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new zt},sheen:{value:0},sheenColor:{value:new Gt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new zt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new zt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new zt},transmissionSamplerSize:{value:new kt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new zt},attenuationDistance:{value:0},attenuationColor:{value:new Gt(0)},specularColor:{value:new Gt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new zt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new zt},anisotropyVector:{value:new kt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new zt}}]),vertexShader:It.meshphysical_vert,fragmentShader:It.meshphysical_frag};const os={r:0,b:0,g:0};function gd(i,t,e,n,s,r,o){const a=new Gt(0);let l=r===!0?0:1,c,h,d=null,p=0,m=null;function _(f,u){let T=!1,y=u.isScene===!0?u.background:null;y&&y.isTexture&&(y=(u.backgroundBlurriness>0?e:t).get(y)),y===null?g(a,l):y&&y.isColor&&(g(y,1),T=!0);const A=i.xr.getEnvironmentBlendMode();A==="additive"?n.buffers.color.setClear(0,0,0,1,o):A==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,o),(i.autoClear||T)&&i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil),y&&(y.isCubeTexture||y.mapping===Ts)?(h===void 0&&(h=new $e(new Bi(1,1,1),new fn({name:"BackgroundCubeMaterial",uniforms:mi(Qe.backgroundCube.uniforms),vertexShader:Qe.backgroundCube.vertexShader,fragmentShader:Qe.backgroundCube.fragmentShader,side:be,depthTest:!1,depthWrite:!1,fog:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(C,b,w){this.matrixWorld.copyPosition(w.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(h)),h.material.uniforms.envMap.value=y,h.material.uniforms.flipEnvMap.value=y.isCubeTexture&&y.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=u.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=u.backgroundIntensity,h.material.toneMapped=Yt.getTransfer(y.colorSpace)!==Jt,(d!==y||p!==y.version||m!==i.toneMapping)&&(h.material.needsUpdate=!0,d=y,p=y.version,m=i.toneMapping),h.layers.enableAll(),f.unshift(h,h.geometry,h.material,0,0,null)):y&&y.isTexture&&(c===void 0&&(c=new $e(new Cr(2,2),new fn({name:"BackgroundMaterial",uniforms:mi(Qe.background.uniforms),vertexShader:Qe.background.vertexShader,fragmentShader:Qe.background.fragmentShader,side:bn,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(c)),c.material.uniforms.t2D.value=y,c.material.uniforms.backgroundIntensity.value=u.backgroundIntensity,c.material.toneMapped=Yt.getTransfer(y.colorSpace)!==Jt,y.matrixAutoUpdate===!0&&y.updateMatrix(),c.material.uniforms.uvTransform.value.copy(y.matrix),(d!==y||p!==y.version||m!==i.toneMapping)&&(c.material.needsUpdate=!0,d=y,p=y.version,m=i.toneMapping),c.layers.enableAll(),f.unshift(c,c.geometry,c.material,0,0,null))}function g(f,u){f.getRGB(os,ko(i)),n.buffers.color.setClear(os.r,os.g,os.b,u,o)}return{getClearColor:function(){return a},setClearColor:function(f,u=1){a.set(f),l=u,g(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(f){l=f,g(a,l)},render:_}}function _d(i,t,e,n){const s=i.getParameter(i.MAX_VERTEX_ATTRIBS),r=n.isWebGL2?null:t.get("OES_vertex_array_object"),o=n.isWebGL2||r!==null,a={},l=f(null);let c=l,h=!1;function d(P,H,k,Y,X){let q=!1;if(o){const j=g(Y,k,H);c!==j&&(c=j,m(c.object)),q=u(P,Y,k,X),q&&T(P,Y,k,X)}else{const j=H.wireframe===!0;(c.geometry!==Y.id||c.program!==k.id||c.wireframe!==j)&&(c.geometry=Y.id,c.program=k.id,c.wireframe=j,q=!0)}X!==null&&e.update(X,i.ELEMENT_ARRAY_BUFFER),(q||h)&&(h=!1,$(P,H,k,Y),X!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(X).buffer))}function p(){return n.isWebGL2?i.createVertexArray():r.createVertexArrayOES()}function m(P){return n.isWebGL2?i.bindVertexArray(P):r.bindVertexArrayOES(P)}function _(P){return n.isWebGL2?i.deleteVertexArray(P):r.deleteVertexArrayOES(P)}function g(P,H,k){const Y=k.wireframe===!0;let X=a[P.id];X===void 0&&(X={},a[P.id]=X);let q=X[H.id];q===void 0&&(q={},X[H.id]=q);let j=q[Y];return j===void 0&&(j=f(p()),q[Y]=j),j}function f(P){const H=[],k=[],Y=[];for(let X=0;X<s;X++)H[X]=0,k[X]=0,Y[X]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:H,enabledAttributes:k,attributeDivisors:Y,object:P,attributes:{},index:null}}function u(P,H,k,Y){const X=c.attributes,q=H.attributes;let j=0;const et=k.getAttributes();for(const it in et)if(et[it].location>=0){const K=X[it];let ct=q[it];if(ct===void 0&&(it==="instanceMatrix"&&P.instanceMatrix&&(ct=P.instanceMatrix),it==="instanceColor"&&P.instanceColor&&(ct=P.instanceColor)),K===void 0||K.attribute!==ct||ct&&K.data!==ct.data)return!0;j++}return c.attributesNum!==j||c.index!==Y}function T(P,H,k,Y){const X={},q=H.attributes;let j=0;const et=k.getAttributes();for(const it in et)if(et[it].location>=0){let K=q[it];K===void 0&&(it==="instanceMatrix"&&P.instanceMatrix&&(K=P.instanceMatrix),it==="instanceColor"&&P.instanceColor&&(K=P.instanceColor));const ct={};ct.attribute=K,K&&K.data&&(ct.data=K.data),X[it]=ct,j++}c.attributes=X,c.attributesNum=j,c.index=Y}function y(){const P=c.newAttributes;for(let H=0,k=P.length;H<k;H++)P[H]=0}function A(P){C(P,0)}function C(P,H){const k=c.newAttributes,Y=c.enabledAttributes,X=c.attributeDivisors;k[P]=1,Y[P]===0&&(i.enableVertexAttribArray(P),Y[P]=1),X[P]!==H&&((n.isWebGL2?i:t.get("ANGLE_instanced_arrays"))[n.isWebGL2?"vertexAttribDivisor":"vertexAttribDivisorANGLE"](P,H),X[P]=H)}function b(){const P=c.newAttributes,H=c.enabledAttributes;for(let k=0,Y=H.length;k<Y;k++)H[k]!==P[k]&&(i.disableVertexAttribArray(k),H[k]=0)}function w(P,H,k,Y,X,q,j){j===!0?i.vertexAttribIPointer(P,H,k,X,q):i.vertexAttribPointer(P,H,k,Y,X,q)}function $(P,H,k,Y){if(n.isWebGL2===!1&&(P.isInstancedMesh||Y.isInstancedBufferGeometry)&&t.get("ANGLE_instanced_arrays")===null)return;y();const X=Y.attributes,q=k.getAttributes(),j=H.defaultAttributeValues;for(const et in q){const it=q[et];if(it.location>=0){let G=X[et];if(G===void 0&&(et==="instanceMatrix"&&P.instanceMatrix&&(G=P.instanceMatrix),et==="instanceColor"&&P.instanceColor&&(G=P.instanceColor)),G!==void 0){const K=G.normalized,ct=G.itemSize,_t=e.get(G);if(_t===void 0)continue;const gt=_t.buffer,Ct=_t.type,Lt=_t.bytesPerElement,Et=n.isWebGL2===!0&&(Ct===i.INT||Ct===i.UNSIGNED_INT||G.gpuType===Eo);if(G.isInterleavedBufferAttribute){const Vt=G.data,N=Vt.stride,Me=G.offset;if(Vt.isInstancedInterleavedBuffer){for(let xt=0;xt<it.locationSize;xt++)C(it.location+xt,Vt.meshPerAttribute);P.isInstancedMesh!==!0&&Y._maxInstanceCount===void 0&&(Y._maxInstanceCount=Vt.meshPerAttribute*Vt.count)}else for(let xt=0;xt<it.locationSize;xt++)A(it.location+xt);i.bindBuffer(i.ARRAY_BUFFER,gt);for(let xt=0;xt<it.locationSize;xt++)w(it.location+xt,ct/it.locationSize,Ct,K,N*Lt,(Me+ct/it.locationSize*xt)*Lt,Et)}else{if(G.isInstancedBufferAttribute){for(let Vt=0;Vt<it.locationSize;Vt++)C(it.location+Vt,G.meshPerAttribute);P.isInstancedMesh!==!0&&Y._maxInstanceCount===void 0&&(Y._maxInstanceCount=G.meshPerAttribute*G.count)}else for(let Vt=0;Vt<it.locationSize;Vt++)A(it.location+Vt);i.bindBuffer(i.ARRAY_BUFFER,gt);for(let Vt=0;Vt<it.locationSize;Vt++)w(it.location+Vt,ct/it.locationSize,Ct,K,ct*Lt,ct/it.locationSize*Vt*Lt,Et)}}else if(j!==void 0){const K=j[et];if(K!==void 0)switch(K.length){case 2:i.vertexAttrib2fv(it.location,K);break;case 3:i.vertexAttrib3fv(it.location,K);break;case 4:i.vertexAttrib4fv(it.location,K);break;default:i.vertexAttrib1fv(it.location,K)}}}}b()}function M(){W();for(const P in a){const H=a[P];for(const k in H){const Y=H[k];for(const X in Y)_(Y[X].object),delete Y[X];delete H[k]}delete a[P]}}function E(P){if(a[P.id]===void 0)return;const H=a[P.id];for(const k in H){const Y=H[k];for(const X in Y)_(Y[X].object),delete Y[X];delete H[k]}delete a[P.id]}function V(P){for(const H in a){const k=a[H];if(k[P.id]===void 0)continue;const Y=k[P.id];for(const X in Y)_(Y[X].object),delete Y[X];delete k[P.id]}}function W(){nt(),h=!0,c!==l&&(c=l,m(c.object))}function nt(){l.geometry=null,l.program=null,l.wireframe=!1}return{setup:d,reset:W,resetDefaultState:nt,dispose:M,releaseStatesOfGeometry:E,releaseStatesOfProgram:V,initAttributes:y,enableAttribute:A,disableUnusedAttributes:b}}function vd(i,t,e,n){const s=n.isWebGL2;let r;function o(h){r=h}function a(h,d){i.drawArrays(r,h,d),e.update(d,r,1)}function l(h,d,p){if(p===0)return;let m,_;if(s)m=i,_="drawArraysInstanced";else if(m=t.get("ANGLE_instanced_arrays"),_="drawArraysInstancedANGLE",m===null){console.error("THREE.WebGLBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");return}m[_](r,h,d,p),e.update(d,r,p)}function c(h,d,p){if(p===0)return;const m=t.get("WEBGL_multi_draw");if(m===null)for(let _=0;_<p;_++)this.render(h[_],d[_]);else{m.multiDrawArraysWEBGL(r,h,0,d,0,p);let _=0;for(let g=0;g<p;g++)_+=d[g];e.update(_,r,1)}}this.setMode=o,this.render=a,this.renderInstances=l,this.renderMultiDraw=c}function xd(i,t,e){let n;function s(){if(n!==void 0)return n;if(t.has("EXT_texture_filter_anisotropic")===!0){const w=t.get("EXT_texture_filter_anisotropic");n=i.getParameter(w.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else n=0;return n}function r(w){if(w==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";w="mediump"}return w==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}const o=typeof WebGL2RenderingContext<"u"&&i.constructor.name==="WebGL2RenderingContext";let a=e.precision!==void 0?e.precision:"highp";const l=r(a);l!==a&&(console.warn("THREE.WebGLRenderer:",a,"not supported, using",l,"instead."),a=l);const c=o||t.has("WEBGL_draw_buffers"),h=e.logarithmicDepthBuffer===!0,d=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),p=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),m=i.getParameter(i.MAX_TEXTURE_SIZE),_=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),g=i.getParameter(i.MAX_VERTEX_ATTRIBS),f=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),u=i.getParameter(i.MAX_VARYING_VECTORS),T=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),y=p>0,A=o||t.has("OES_texture_float"),C=y&&A,b=o?i.getParameter(i.MAX_SAMPLES):0;return{isWebGL2:o,drawBuffers:c,getMaxAnisotropy:s,getMaxPrecision:r,precision:a,logarithmicDepthBuffer:h,maxTextures:d,maxVertexTextures:p,maxTextureSize:m,maxCubemapSize:_,maxAttributes:g,maxVertexUniforms:f,maxVaryings:u,maxFragmentUniforms:T,vertexTextures:y,floatFragmentTextures:A,floatVertexTextures:C,maxSamples:b}}function Md(i){const t=this;let e=null,n=0,s=!1,r=!1;const o=new In,a=new zt,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(d,p){const m=d.length!==0||p||n!==0||s;return s=p,n=d.length,m},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(d,p){e=h(d,p,0)},this.setState=function(d,p,m){const _=d.clippingPlanes,g=d.clipIntersection,f=d.clipShadows,u=i.get(d);if(!s||_===null||_.length===0||r&&!f)r?h(null):c();else{const T=r?0:n,y=T*4;let A=u.clippingState||null;l.value=A,A=h(_,p,y,m);for(let C=0;C!==y;++C)A[C]=e[C];u.clippingState=A,this.numIntersection=g?this.numPlanes:0,this.numPlanes+=T}};function c(){l.value!==e&&(l.value=e,l.needsUpdate=n>0),t.numPlanes=n,t.numIntersection=0}function h(d,p,m,_){const g=d!==null?d.length:0;let f=null;if(g!==0){if(f=l.value,_!==!0||f===null){const u=m+g*4,T=p.matrixWorldInverse;a.getNormalMatrix(T),(f===null||f.length<u)&&(f=new Float32Array(u));for(let y=0,A=m;y!==g;++y,A+=4)o.copy(d[y]).applyMatrix4(T,a),o.normal.toArray(f,A),f[A+3]=o.constant}l.value=f,l.needsUpdate=!0}return t.numPlanes=g,t.numIntersection=0,f}}function Sd(i){let t=new WeakMap;function e(o,a){return a===pr?o.mapping=di:a===mr&&(o.mapping=fi),o}function n(o){if(o&&o.isTexture){const a=o.mapping;if(a===pr||a===mr)if(t.has(o)){const l=t.get(o).texture;return e(l,o.mapping)}else{const l=o.image;if(l&&l.height>0){const c=new Ic(l.height/2);return c.fromEquirectangularTexture(i,o),t.set(o,c),o.addEventListener("dispose",s),e(c.texture,o.mapping)}else return null}}return o}function s(o){const a=o.target;a.removeEventListener("dispose",s);const l=t.get(a);l!==void 0&&(t.delete(a),l.dispose())}function r(){t=new WeakMap}return{get:n,dispose:r}}class yd extends Wo{constructor(t=-1,e=1,n=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let r=n-t,o=n+t,a=s+e,l=s-e;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,o=r+c*this.view.width,a-=h*this.view.offsetY,l=a-h*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}}const ai=4,Oa=[.125,.215,.35,.446,.526,.582],Fn=20,ir=new yd,Ba=new Gt;let sr=null,rr=0,ar=0;const Un=(1+Math.sqrt(5))/2,ri=1/Un,za=[new D(1,1,1),new D(-1,1,1),new D(1,1,-1),new D(-1,1,-1),new D(0,Un,ri),new D(0,Un,-ri),new D(ri,0,Un),new D(-ri,0,Un),new D(Un,ri,0),new D(-Un,ri,0)];class Ha{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(t,e=0,n=.1,s=100){sr=this._renderer.getRenderTarget(),rr=this._renderer.getActiveCubeFace(),ar=this._renderer.getActiveMipmapLevel(),this._setSize(256);const r=this._allocateTargets();return r.depthBuffer=!0,this._sceneToCubeUV(t,n,s,r),e>0&&this._blur(r,0,0,e),this._applyPMREM(r),this._cleanup(r),r}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=ka(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Va(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodPlanes.length;t++)this._lodPlanes[t].dispose()}_cleanup(t){this._renderer.setRenderTarget(sr,rr,ar),t.scissorTest=!1,ls(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===di||t.mapping===fi?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),sr=this._renderer.getRenderTarget(),rr=this._renderer.getActiveCubeFace(),ar=this._renderer.getActiveMipmapLevel();const n=e||this._allocateTargets();return this._textureToCubeUV(t,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,n={magFilter:ze,minFilter:ze,generateMipmaps:!1,type:Ii,format:Ye,colorSpace:dn,depthBuffer:!1},s=Ga(t,e,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Ga(t,e,n);const{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=Ed(r)),this._blurMaterial=Td(r,t,e)}return s}_compileMaterial(t){const e=new $e(this._lodPlanes[0],t);this._renderer.compile(e,ir)}_sceneToCubeUV(t,e,n,s){const a=new Ne(90,1,e,n),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],h=this._renderer,d=h.autoClear,p=h.toneMapping;h.getClearColor(Ba),h.toneMapping=Tn,h.autoClear=!1;const m=new Li({name:"PMREM.Background",side:be,depthWrite:!1,depthTest:!1}),_=new $e(new Bi,m);let g=!1;const f=t.background;f?f.isColor&&(m.color.copy(f),t.background=null,g=!0):(m.color.copy(Ba),g=!0);for(let u=0;u<6;u++){const T=u%3;T===0?(a.up.set(0,l[u],0),a.lookAt(c[u],0,0)):T===1?(a.up.set(0,0,l[u]),a.lookAt(0,c[u],0)):(a.up.set(0,l[u],0),a.lookAt(0,0,c[u]));const y=this._cubeSize;ls(s,T*y,u>2?y:0,y,y),h.setRenderTarget(s),g&&h.render(_,a),h.render(t,a)}_.geometry.dispose(),_.material.dispose(),h.toneMapping=p,h.autoClear=d,t.background=f}_textureToCubeUV(t,e){const n=this._renderer,s=t.mapping===di||t.mapping===fi;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=ka()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Va());const r=s?this._cubemapMaterial:this._equirectMaterial,o=new $e(this._lodPlanes[0],r),a=r.uniforms;a.envMap.value=t;const l=this._cubeSize;ls(e,0,0,3*l,2*l),n.setRenderTarget(e),n.render(o,ir)}_applyPMREM(t){const e=this._renderer,n=e.autoClear;e.autoClear=!1;for(let s=1;s<this._lodPlanes.length;s++){const r=Math.sqrt(this._sigmas[s]*this._sigmas[s]-this._sigmas[s-1]*this._sigmas[s-1]),o=za[(s-1)%za.length];this._blur(t,s-1,s,r,o)}e.autoClear=n}_blur(t,e,n,s,r){const o=this._pingPongRenderTarget;this._halfBlur(t,o,e,n,s,"latitudinal",r),this._halfBlur(o,t,n,n,s,"longitudinal",r)}_halfBlur(t,e,n,s,r,o,a){const l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const h=3,d=new $e(this._lodPlanes[s],c),p=c.uniforms,m=this._sizeLods[n]-1,_=isFinite(r)?Math.PI/(2*m):2*Math.PI/(2*Fn-1),g=r/_,f=isFinite(r)?1+Math.floor(h*g):Fn;f>Fn&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${f} samples when the maximum is set to ${Fn}`);const u=[];let T=0;for(let w=0;w<Fn;++w){const $=w/g,M=Math.exp(-$*$/2);u.push(M),w===0?T+=M:w<f&&(T+=2*M)}for(let w=0;w<u.length;w++)u[w]=u[w]/T;p.envMap.value=t.texture,p.samples.value=f,p.weights.value=u,p.latitudinal.value=o==="latitudinal",a&&(p.poleAxis.value=a);const{_lodMax:y}=this;p.dTheta.value=_,p.mipInt.value=y-n;const A=this._sizeLods[s],C=3*A*(s>y-ai?s-y+ai:0),b=4*(this._cubeSize-A);ls(e,C,b,3*A,2*A),l.setRenderTarget(e),l.render(d,ir)}}function Ed(i){const t=[],e=[],n=[];let s=i;const r=i-ai+1+Oa.length;for(let o=0;o<r;o++){const a=Math.pow(2,s);e.push(a);let l=1/a;o>i-ai?l=Oa[o-i+ai-1]:o===0&&(l=0),n.push(l);const c=1/(a-2),h=-c,d=1+c,p=[h,h,d,h,d,d,h,h,d,d,h,d],m=6,_=6,g=3,f=2,u=1,T=new Float32Array(g*_*m),y=new Float32Array(f*_*m),A=new Float32Array(u*_*m);for(let b=0;b<m;b++){const w=b%3*2/3-1,$=b>2?0:-1,M=[w,$,0,w+2/3,$,0,w+2/3,$+1,0,w,$,0,w+2/3,$+1,0,w,$+1,0];T.set(M,g*_*b),y.set(p,f*_*b);const E=[b,b,b,b,b,b];A.set(E,u*_*b)}const C=new Ke;C.setAttribute("position",new Ae(T,g)),C.setAttribute("uv",new Ae(y,f)),C.setAttribute("faceIndex",new Ae(A,u)),t.push(C),s>ai&&s--}return{lodPlanes:t,sizeLods:e,sigmas:n}}function Ga(i,t,e){const n=new Hn(i,t,e);return n.texture.mapping=Ts,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function ls(i,t,e,n,s){i.viewport.set(t,e,n,s),i.scissor.set(t,e,n,s)}function Td(i,t,e){const n=new Float32Array(Fn),s=new D(0,1,0);return new fn({name:"SphericalGaussianBlur",defines:{n:Fn,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:Pr(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:En,depthTest:!1,depthWrite:!1})}function Va(){return new fn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Pr(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:En,depthTest:!1,depthWrite:!1})}function ka(){return new fn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Pr(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:En,depthTest:!1,depthWrite:!1})}function Pr(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function Ad(i){let t=new WeakMap,e=null;function n(a){if(a&&a.isTexture){const l=a.mapping,c=l===pr||l===mr,h=l===di||l===fi;if(c||h)if(a.isRenderTargetTexture&&a.needsPMREMUpdate===!0){a.needsPMREMUpdate=!1;let d=t.get(a);return e===null&&(e=new Ha(i)),d=c?e.fromEquirectangular(a,d):e.fromCubemap(a,d),t.set(a,d),d.texture}else{if(t.has(a))return t.get(a).texture;{const d=a.image;if(c&&d&&d.height>0||h&&d&&s(d)){e===null&&(e=new Ha(i));const p=c?e.fromEquirectangular(a):e.fromCubemap(a);return t.set(a,p),a.addEventListener("dispose",r),p.texture}else return null}}}return a}function s(a){let l=0;const c=6;for(let h=0;h<c;h++)a[h]!==void 0&&l++;return l===c}function r(a){const l=a.target;l.removeEventListener("dispose",r);const c=t.get(l);c!==void 0&&(t.delete(l),c.dispose())}function o(){t=new WeakMap,e!==null&&(e.dispose(),e=null)}return{get:n,dispose:o}}function bd(i){const t={};function e(n){if(t[n]!==void 0)return t[n];let s;switch(n){case"WEBGL_depth_texture":s=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=i.getExtension(n)}return t[n]=s,s}return{has:function(n){return e(n)!==null},init:function(n){n.isWebGL2?(e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance")):(e("WEBGL_depth_texture"),e("OES_texture_float"),e("OES_texture_half_float"),e("OES_texture_half_float_linear"),e("OES_standard_derivatives"),e("OES_element_index_uint"),e("OES_vertex_array_object"),e("ANGLE_instanced_arrays")),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture")},get:function(n){const s=e(n);return s===null&&console.warn("THREE.WebGLRenderer: "+n+" extension not supported."),s}}}function wd(i,t,e,n){const s={},r=new WeakMap;function o(d){const p=d.target;p.index!==null&&t.remove(p.index);for(const _ in p.attributes)t.remove(p.attributes[_]);for(const _ in p.morphAttributes){const g=p.morphAttributes[_];for(let f=0,u=g.length;f<u;f++)t.remove(g[f])}p.removeEventListener("dispose",o),delete s[p.id];const m=r.get(p);m&&(t.remove(m),r.delete(p)),n.releaseStatesOfGeometry(p),p.isInstancedBufferGeometry===!0&&delete p._maxInstanceCount,e.memory.geometries--}function a(d,p){return s[p.id]===!0||(p.addEventListener("dispose",o),s[p.id]=!0,e.memory.geometries++),p}function l(d){const p=d.attributes;for(const _ in p)t.update(p[_],i.ARRAY_BUFFER);const m=d.morphAttributes;for(const _ in m){const g=m[_];for(let f=0,u=g.length;f<u;f++)t.update(g[f],i.ARRAY_BUFFER)}}function c(d){const p=[],m=d.index,_=d.attributes.position;let g=0;if(m!==null){const T=m.array;g=m.version;for(let y=0,A=T.length;y<A;y+=3){const C=T[y+0],b=T[y+1],w=T[y+2];p.push(C,b,b,w,w,C)}}else if(_!==void 0){const T=_.array;g=_.version;for(let y=0,A=T.length/3-1;y<A;y+=3){const C=y+0,b=y+1,w=y+2;p.push(C,b,b,w,w,C)}}else return;const f=new(Io(p)?Vo:Go)(p,1);f.version=g;const u=r.get(d);u&&t.remove(u),r.set(d,f)}function h(d){const p=r.get(d);if(p){const m=d.index;m!==null&&p.version<m.version&&c(d)}else c(d);return r.get(d)}return{get:a,update:l,getWireframeAttribute:h}}function Rd(i,t,e,n){const s=n.isWebGL2;let r;function o(m){r=m}let a,l;function c(m){a=m.type,l=m.bytesPerElement}function h(m,_){i.drawElements(r,_,a,m*l),e.update(_,r,1)}function d(m,_,g){if(g===0)return;let f,u;if(s)f=i,u="drawElementsInstanced";else if(f=t.get("ANGLE_instanced_arrays"),u="drawElementsInstancedANGLE",f===null){console.error("THREE.WebGLIndexedBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");return}f[u](r,_,a,m*l,g),e.update(_,r,g)}function p(m,_,g){if(g===0)return;const f=t.get("WEBGL_multi_draw");if(f===null)for(let u=0;u<g;u++)this.render(m[u]/l,_[u]);else{f.multiDrawElementsWEBGL(r,_,0,a,m,0,g);let u=0;for(let T=0;T<g;T++)u+=_[T];e.update(u,r,1)}}this.setMode=o,this.setIndex=c,this.render=h,this.renderInstances=d,this.renderMultiDraw=p}function Cd(i){const t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,o,a){switch(e.calls++,o){case i.TRIANGLES:e.triangles+=a*(r/3);break;case i.LINES:e.lines+=a*(r/2);break;case i.LINE_STRIP:e.lines+=a*(r-1);break;case i.LINE_LOOP:e.lines+=a*r;break;case i.POINTS:e.points+=a*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function s(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:s,update:n}}function Pd(i,t){return i[0]-t[0]}function Ld(i,t){return Math.abs(t[1])-Math.abs(i[1])}function Dd(i,t,e){const n={},s=new Float32Array(8),r=new WeakMap,o=new Qt,a=[];for(let c=0;c<8;c++)a[c]=[c,0];function l(c,h,d){const p=c.morphTargetInfluences;if(t.isWebGL2===!0){const _=h.morphAttributes.position||h.morphAttributes.normal||h.morphAttributes.color,g=_!==void 0?_.length:0;let f=r.get(h);if(f===void 0||f.count!==g){let H=function(){nt.dispose(),r.delete(h),h.removeEventListener("dispose",H)};var m=H;f!==void 0&&f.texture.dispose();const y=h.morphAttributes.position!==void 0,A=h.morphAttributes.normal!==void 0,C=h.morphAttributes.color!==void 0,b=h.morphAttributes.position||[],w=h.morphAttributes.normal||[],$=h.morphAttributes.color||[];let M=0;y===!0&&(M=1),A===!0&&(M=2),C===!0&&(M=3);let E=h.attributes.position.count*M,V=1;E>t.maxTextureSize&&(V=Math.ceil(E/t.maxTextureSize),E=t.maxTextureSize);const W=new Float32Array(E*V*4*g),nt=new Fo(W,E,V,g);nt.type=Sn,nt.needsUpdate=!0;const P=M*4;for(let k=0;k<g;k++){const Y=b[k],X=w[k],q=$[k],j=E*V*4*k;for(let et=0;et<Y.count;et++){const it=et*P;y===!0&&(o.fromBufferAttribute(Y,et),W[j+it+0]=o.x,W[j+it+1]=o.y,W[j+it+2]=o.z,W[j+it+3]=0),A===!0&&(o.fromBufferAttribute(X,et),W[j+it+4]=o.x,W[j+it+5]=o.y,W[j+it+6]=o.z,W[j+it+7]=0),C===!0&&(o.fromBufferAttribute(q,et),W[j+it+8]=o.x,W[j+it+9]=o.y,W[j+it+10]=o.z,W[j+it+11]=q.itemSize===4?o.w:1)}}f={count:g,texture:nt,size:new kt(E,V)},r.set(h,f),h.addEventListener("dispose",H)}let u=0;for(let y=0;y<p.length;y++)u+=p[y];const T=h.morphTargetsRelative?1:1-u;d.getUniforms().setValue(i,"morphTargetBaseInfluence",T),d.getUniforms().setValue(i,"morphTargetInfluences",p),d.getUniforms().setValue(i,"morphTargetsTexture",f.texture,e),d.getUniforms().setValue(i,"morphTargetsTextureSize",f.size)}else{const _=p===void 0?0:p.length;let g=n[h.id];if(g===void 0||g.length!==_){g=[];for(let A=0;A<_;A++)g[A]=[A,0];n[h.id]=g}for(let A=0;A<_;A++){const C=g[A];C[0]=A,C[1]=p[A]}g.sort(Ld);for(let A=0;A<8;A++)A<_&&g[A][1]?(a[A][0]=g[A][0],a[A][1]=g[A][1]):(a[A][0]=Number.MAX_SAFE_INTEGER,a[A][1]=0);a.sort(Pd);const f=h.morphAttributes.position,u=h.morphAttributes.normal;let T=0;for(let A=0;A<8;A++){const C=a[A],b=C[0],w=C[1];b!==Number.MAX_SAFE_INTEGER&&w?(f&&h.getAttribute("morphTarget"+A)!==f[b]&&h.setAttribute("morphTarget"+A,f[b]),u&&h.getAttribute("morphNormal"+A)!==u[b]&&h.setAttribute("morphNormal"+A,u[b]),s[A]=w,T+=w):(f&&h.hasAttribute("morphTarget"+A)===!0&&h.deleteAttribute("morphTarget"+A),u&&h.hasAttribute("morphNormal"+A)===!0&&h.deleteAttribute("morphNormal"+A),s[A]=0)}const y=h.morphTargetsRelative?1:1-T;d.getUniforms().setValue(i,"morphTargetBaseInfluence",y),d.getUniforms().setValue(i,"morphTargetInfluences",s)}}return{update:l}}function Id(i,t,e,n){let s=new WeakMap;function r(l){const c=n.render.frame,h=l.geometry,d=t.get(l,h);if(s.get(d)!==c&&(t.update(d),s.set(d,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),s.get(l)!==c&&(e.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&e.update(l.instanceColor,i.ARRAY_BUFFER),s.set(l,c))),l.isSkinnedMesh){const p=l.skeleton;s.get(p)!==c&&(p.update(),s.set(p,c))}return d}function o(){s=new WeakMap}function a(l){const c=l.target;c.removeEventListener("dispose",a),e.remove(c.instanceMatrix),c.instanceColor!==null&&e.remove(c.instanceColor)}return{update:r,dispose:o}}class Yo extends Le{constructor(t,e,n,s,r,o,a,l,c,h){if(h=h!==void 0?h:Bn,h!==Bn&&h!==pi)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&h===Bn&&(n=Mn),n===void 0&&h===pi&&(n=On),super(null,s,r,o,a,l,h,n,c),this.isDepthTexture=!0,this.image={width:t,height:e},this.magFilter=a!==void 0?a:Te,this.minFilter=l!==void 0?l:Te,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.compareFunction=t.compareFunction,this}toJSON(t){const e=super.toJSON(t);return this.compareFunction!==null&&(e.compareFunction=this.compareFunction),e}}const $o=new Le,jo=new Yo(1,1);jo.compareFunction=Do;const Ko=new Fo,Zo=new gc,Jo=new Xo,Wa=[],Xa=[],qa=new Float32Array(16),Ya=new Float32Array(9),$a=new Float32Array(4);function Mi(i,t,e){const n=i[0];if(n<=0||n>0)return i;const s=t*e;let r=Wa[s];if(r===void 0&&(r=new Float32Array(s),Wa[s]=r),t!==0){n.toArray(r,0);for(let o=1,a=0;o!==t;++o)a+=e,i[o].toArray(r,a)}return r}function oe(i,t){if(i.length!==t.length)return!1;for(let e=0,n=i.length;e<n;e++)if(i[e]!==t[e])return!1;return!0}function le(i,t){for(let e=0,n=t.length;e<n;e++)i[e]=t[e]}function ws(i,t){let e=Xa[t];e===void 0&&(e=new Int32Array(t),Xa[t]=e);for(let n=0;n!==t;++n)e[n]=i.allocateTextureUnit();return e}function Ud(i,t){const e=this.cache;e[0]!==t&&(i.uniform1f(this.addr,t),e[0]=t)}function Nd(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(oe(e,t))return;i.uniform2fv(this.addr,t),le(e,t)}}function Fd(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(i.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(oe(e,t))return;i.uniform3fv(this.addr,t),le(e,t)}}function Od(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(oe(e,t))return;i.uniform4fv(this.addr,t),le(e,t)}}function Bd(i,t){const e=this.cache,n=t.elements;if(n===void 0){if(oe(e,t))return;i.uniformMatrix2fv(this.addr,!1,t),le(e,t)}else{if(oe(e,n))return;$a.set(n),i.uniformMatrix2fv(this.addr,!1,$a),le(e,n)}}function zd(i,t){const e=this.cache,n=t.elements;if(n===void 0){if(oe(e,t))return;i.uniformMatrix3fv(this.addr,!1,t),le(e,t)}else{if(oe(e,n))return;Ya.set(n),i.uniformMatrix3fv(this.addr,!1,Ya),le(e,n)}}function Hd(i,t){const e=this.cache,n=t.elements;if(n===void 0){if(oe(e,t))return;i.uniformMatrix4fv(this.addr,!1,t),le(e,t)}else{if(oe(e,n))return;qa.set(n),i.uniformMatrix4fv(this.addr,!1,qa),le(e,n)}}function Gd(i,t){const e=this.cache;e[0]!==t&&(i.uniform1i(this.addr,t),e[0]=t)}function Vd(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(oe(e,t))return;i.uniform2iv(this.addr,t),le(e,t)}}function kd(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(oe(e,t))return;i.uniform3iv(this.addr,t),le(e,t)}}function Wd(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(oe(e,t))return;i.uniform4iv(this.addr,t),le(e,t)}}function Xd(i,t){const e=this.cache;e[0]!==t&&(i.uniform1ui(this.addr,t),e[0]=t)}function qd(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(oe(e,t))return;i.uniform2uiv(this.addr,t),le(e,t)}}function Yd(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(oe(e,t))return;i.uniform3uiv(this.addr,t),le(e,t)}}function $d(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(oe(e,t))return;i.uniform4uiv(this.addr,t),le(e,t)}}function jd(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);const r=this.type===i.SAMPLER_2D_SHADOW?jo:$o;e.setTexture2D(t||r,s)}function Kd(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture3D(t||Zo,s)}function Zd(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTextureCube(t||Jo,s)}function Jd(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture2DArray(t||Ko,s)}function Qd(i){switch(i){case 5126:return Ud;case 35664:return Nd;case 35665:return Fd;case 35666:return Od;case 35674:return Bd;case 35675:return zd;case 35676:return Hd;case 5124:case 35670:return Gd;case 35667:case 35671:return Vd;case 35668:case 35672:return kd;case 35669:case 35673:return Wd;case 5125:return Xd;case 36294:return qd;case 36295:return Yd;case 36296:return $d;case 35678:case 36198:case 36298:case 36306:case 35682:return jd;case 35679:case 36299:case 36307:return Kd;case 35680:case 36300:case 36308:case 36293:return Zd;case 36289:case 36303:case 36311:case 36292:return Jd}}function tf(i,t){i.uniform1fv(this.addr,t)}function ef(i,t){const e=Mi(t,this.size,2);i.uniform2fv(this.addr,e)}function nf(i,t){const e=Mi(t,this.size,3);i.uniform3fv(this.addr,e)}function sf(i,t){const e=Mi(t,this.size,4);i.uniform4fv(this.addr,e)}function rf(i,t){const e=Mi(t,this.size,4);i.uniformMatrix2fv(this.addr,!1,e)}function af(i,t){const e=Mi(t,this.size,9);i.uniformMatrix3fv(this.addr,!1,e)}function of(i,t){const e=Mi(t,this.size,16);i.uniformMatrix4fv(this.addr,!1,e)}function lf(i,t){i.uniform1iv(this.addr,t)}function cf(i,t){i.uniform2iv(this.addr,t)}function hf(i,t){i.uniform3iv(this.addr,t)}function uf(i,t){i.uniform4iv(this.addr,t)}function df(i,t){i.uniform1uiv(this.addr,t)}function ff(i,t){i.uniform2uiv(this.addr,t)}function pf(i,t){i.uniform3uiv(this.addr,t)}function mf(i,t){i.uniform4uiv(this.addr,t)}function gf(i,t,e){const n=this.cache,s=t.length,r=ws(e,s);oe(n,r)||(i.uniform1iv(this.addr,r),le(n,r));for(let o=0;o!==s;++o)e.setTexture2D(t[o]||$o,r[o])}function _f(i,t,e){const n=this.cache,s=t.length,r=ws(e,s);oe(n,r)||(i.uniform1iv(this.addr,r),le(n,r));for(let o=0;o!==s;++o)e.setTexture3D(t[o]||Zo,r[o])}function vf(i,t,e){const n=this.cache,s=t.length,r=ws(e,s);oe(n,r)||(i.uniform1iv(this.addr,r),le(n,r));for(let o=0;o!==s;++o)e.setTextureCube(t[o]||Jo,r[o])}function xf(i,t,e){const n=this.cache,s=t.length,r=ws(e,s);oe(n,r)||(i.uniform1iv(this.addr,r),le(n,r));for(let o=0;o!==s;++o)e.setTexture2DArray(t[o]||Ko,r[o])}function Mf(i){switch(i){case 5126:return tf;case 35664:return ef;case 35665:return nf;case 35666:return sf;case 35674:return rf;case 35675:return af;case 35676:return of;case 5124:case 35670:return lf;case 35667:case 35671:return cf;case 35668:case 35672:return hf;case 35669:case 35673:return uf;case 5125:return df;case 36294:return ff;case 36295:return pf;case 36296:return mf;case 35678:case 36198:case 36298:case 36306:case 35682:return gf;case 35679:case 36299:case 36307:return _f;case 35680:case 36300:case 36308:case 36293:return vf;case 36289:case 36303:case 36311:case 36292:return xf}}class Sf{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.setValue=Qd(e.type)}}class yf{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=Mf(e.type)}}class Ef{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){const s=this.seq;for(let r=0,o=s.length;r!==o;++r){const a=s[r];a.setValue(t,e[a.id],n)}}}const or=/(\w+)(\])?(\[|\.)?/g;function ja(i,t){i.seq.push(t),i.map[t.id]=t}function Tf(i,t,e){const n=i.name,s=n.length;for(or.lastIndex=0;;){const r=or.exec(n),o=or.lastIndex;let a=r[1];const l=r[2]==="]",c=r[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===s){ja(e,c===void 0?new Sf(a,i,t):new yf(a,i,t));break}else{let d=e.map[a];d===void 0&&(d=new Ef(a),ja(e,d)),e=d}}}class fs{constructor(t,e){this.seq=[],this.map={};const n=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let s=0;s<n;++s){const r=t.getActiveUniform(e,s),o=t.getUniformLocation(e,r.name);Tf(r,o,this)}}setValue(t,e,n,s){const r=this.map[e];r!==void 0&&r.setValue(t,n,s)}setOptional(t,e,n){const s=e[n];s!==void 0&&this.setValue(t,n,s)}static upload(t,e,n,s){for(let r=0,o=e.length;r!==o;++r){const a=e[r],l=n[a.id];l.needsUpdate!==!1&&a.setValue(t,l.value,s)}}static seqWithValue(t,e){const n=[];for(let s=0,r=t.length;s!==r;++s){const o=t[s];o.id in e&&n.push(o)}return n}}function Ka(i,t,e){const n=i.createShader(t);return i.shaderSource(n,e),i.compileShader(n),n}const Af=37297;let bf=0;function wf(i,t){const e=i.split(`
`),n=[],s=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let o=s;o<r;o++){const a=o+1;n.push(`${a===t?">":" "} ${a}: ${e[o]}`)}return n.join(`
`)}function Rf(i){const t=Yt.getPrimaries(Yt.workingColorSpace),e=Yt.getPrimaries(i);let n;switch(t===e?n="":t===vs&&e===_s?n="LinearDisplayP3ToLinearSRGB":t===_s&&e===vs&&(n="LinearSRGBToLinearDisplayP3"),i){case dn:case As:return[n,"LinearTransferOETF"];case fe:case wr:return[n,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space:",i),[n,"LinearTransferOETF"]}}function Za(i,t,e){const n=i.getShaderParameter(t,i.COMPILE_STATUS),s=i.getShaderInfoLog(t).trim();if(n&&s==="")return"";const r=/ERROR: 0:(\d+)/.exec(s);if(r){const o=parseInt(r[1]);return e.toUpperCase()+`

`+s+`

`+wf(i.getShaderSource(t),o)}else return s}function Cf(i,t){const e=Rf(t);return`vec4 ${i}( vec4 value ) { return ${e[0]}( ${e[1]}( value ) ); }`}function Pf(i,t){let e;switch(t){case Hl:e="Linear";break;case Gl:e="Reinhard";break;case Vl:e="OptimizedCineon";break;case So:e="ACESFilmic";break;case Wl:e="AgX";break;case kl:e="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",t),e="Linear"}return"vec3 "+i+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}function Lf(i){return[i.extensionDerivatives||i.envMapCubeUVHeight||i.bumpMap||i.normalMapTangentSpace||i.clearcoatNormalMap||i.flatShading||i.shaderID==="physical"?"#extension GL_OES_standard_derivatives : enable":"",(i.extensionFragDepth||i.logarithmicDepthBuffer)&&i.rendererExtensionFragDepth?"#extension GL_EXT_frag_depth : enable":"",i.extensionDrawBuffers&&i.rendererExtensionDrawBuffers?"#extension GL_EXT_draw_buffers : require":"",(i.extensionShaderTextureLOD||i.envMap||i.transmission)&&i.rendererExtensionShaderTextureLod?"#extension GL_EXT_shader_texture_lod : enable":""].filter(oi).join(`
`)}function Df(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":""].filter(oi).join(`
`)}function If(i){const t=[];for(const e in i){const n=i[e];n!==!1&&t.push("#define "+e+" "+n)}return t.join(`
`)}function Uf(i,t){const e={},n=i.getProgramParameter(t,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){const r=i.getActiveAttrib(t,s),o=r.name;let a=1;r.type===i.FLOAT_MAT2&&(a=2),r.type===i.FLOAT_MAT3&&(a=3),r.type===i.FLOAT_MAT4&&(a=4),e[o]={type:r.type,location:i.getAttribLocation(t,o),locationSize:a}}return e}function oi(i){return i!==""}function Ja(i,t){const e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function Qa(i,t){return i.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}const Nf=/^[ \t]*#include +<([\w\d./]+)>/gm;function Sr(i){return i.replace(Nf,Of)}const Ff=new Map([["encodings_fragment","colorspace_fragment"],["encodings_pars_fragment","colorspace_pars_fragment"],["output_fragment","opaque_fragment"]]);function Of(i,t){let e=It[t];if(e===void 0){const n=Ff.get(t);if(n!==void 0)e=It[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,n);else throw new Error("Can not resolve #include <"+t+">")}return Sr(e)}const Bf=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function to(i){return i.replace(Bf,zf)}function zf(i,t,e,n){let s="";for(let r=parseInt(t);r<parseInt(e);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function eo(i){let t="precision "+i.precision+` float;
precision `+i.precision+" int;";return i.precision==="highp"?t+=`
#define HIGH_PRECISION`:i.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}function Hf(i){let t="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===xo?t="SHADOWMAP_TYPE_PCF":i.shadowMapType===pl?t="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===ln&&(t="SHADOWMAP_TYPE_VSM"),t}function Gf(i){let t="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case di:case fi:t="ENVMAP_TYPE_CUBE";break;case Ts:t="ENVMAP_TYPE_CUBE_UV";break}return t}function Vf(i){let t="ENVMAP_MODE_REFLECTION";if(i.envMap)switch(i.envMapMode){case fi:t="ENVMAP_MODE_REFRACTION";break}return t}function kf(i){let t="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case Mo:t="ENVMAP_BLENDING_MULTIPLY";break;case Bl:t="ENVMAP_BLENDING_MIX";break;case zl:t="ENVMAP_BLENDING_ADD";break}return t}function Wf(i){const t=i.envMapCubeUVHeight;if(t===null)return null;const e=Math.log2(t)-2,n=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),7*16)),texelHeight:n,maxMip:e}}function Xf(i,t,e,n){const s=i.getContext(),r=e.defines;let o=e.vertexShader,a=e.fragmentShader;const l=Hf(e),c=Gf(e),h=Vf(e),d=kf(e),p=Wf(e),m=e.isWebGL2?"":Lf(e),_=Df(e),g=If(r),f=s.createProgram();let u,T,y=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(u=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(oi).join(`
`),u.length>0&&(u+=`
`),T=[m,"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(oi).join(`
`),T.length>0&&(T+=`
`)):(u=[eo(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+h:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors&&e.isWebGL2?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0&&e.isWebGL2?"#define MORPHTARGETS_TEXTURE":"",e.morphTargetsCount>0&&e.isWebGL2?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0&&e.isWebGL2?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.useLegacyLights?"#define LEGACY_LIGHTS":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.logarithmicDepthBuffer&&e.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#if ( defined( USE_MORPHTARGETS ) && ! defined( MORPHTARGETS_TEXTURE ) )","	attribute vec3 morphTarget0;","	attribute vec3 morphTarget1;","	attribute vec3 morphTarget2;","	attribute vec3 morphTarget3;","	#ifdef USE_MORPHNORMALS","		attribute vec3 morphNormal0;","		attribute vec3 morphNormal1;","		attribute vec3 morphNormal2;","		attribute vec3 morphNormal3;","	#else","		attribute vec3 morphTarget4;","		attribute vec3 morphTarget5;","		attribute vec3 morphTarget6;","		attribute vec3 morphTarget7;","	#endif","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(oi).join(`
`),T=[m,eo(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+c:"",e.envMap?"#define "+h:"",e.envMap?"#define "+d:"",p?"#define CUBEUV_TEXEL_WIDTH "+p.texelWidth:"",p?"#define CUBEUV_TEXEL_HEIGHT "+p.texelHeight:"",p?"#define CUBEUV_MAX_MIP "+p.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.useLegacyLights?"#define LEGACY_LIGHTS":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.logarithmicDepthBuffer&&e.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==Tn?"#define TONE_MAPPING":"",e.toneMapping!==Tn?It.tonemapping_pars_fragment:"",e.toneMapping!==Tn?Pf("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",It.colorspace_pars_fragment,Cf("linearToOutputTexel",e.outputColorSpace),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(oi).join(`
`)),o=Sr(o),o=Ja(o,e),o=Qa(o,e),a=Sr(a),a=Ja(a,e),a=Qa(a,e),o=to(o),a=to(a),e.isWebGL2&&e.isRawShaderMaterial!==!0&&(y=`#version 300 es
`,u=[_,"precision mediump sampler2DArray;","#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+u,T=["precision mediump sampler2DArray;","#define varying in",e.glslVersion===xa?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===xa?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+T);const A=y+u+o,C=y+T+a,b=Ka(s,s.VERTEX_SHADER,A),w=Ka(s,s.FRAGMENT_SHADER,C);s.attachShader(f,b),s.attachShader(f,w),e.index0AttributeName!==void 0?s.bindAttribLocation(f,0,e.index0AttributeName):e.morphTargets===!0&&s.bindAttribLocation(f,0,"position"),s.linkProgram(f);function $(W){if(i.debug.checkShaderErrors){const nt=s.getProgramInfoLog(f).trim(),P=s.getShaderInfoLog(b).trim(),H=s.getShaderInfoLog(w).trim();let k=!0,Y=!0;if(s.getProgramParameter(f,s.LINK_STATUS)===!1)if(k=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,f,b,w);else{const X=Za(s,b,"vertex"),q=Za(s,w,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(f,s.VALIDATE_STATUS)+`

Program Info Log: `+nt+`
`+X+`
`+q)}else nt!==""?console.warn("THREE.WebGLProgram: Program Info Log:",nt):(P===""||H==="")&&(Y=!1);Y&&(W.diagnostics={runnable:k,programLog:nt,vertexShader:{log:P,prefix:u},fragmentShader:{log:H,prefix:T}})}s.deleteShader(b),s.deleteShader(w),M=new fs(s,f),E=Uf(s,f)}let M;this.getUniforms=function(){return M===void 0&&$(this),M};let E;this.getAttributes=function(){return E===void 0&&$(this),E};let V=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return V===!1&&(V=s.getProgramParameter(f,Af)),V},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(f),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=bf++,this.cacheKey=t,this.usedTimes=1,this.program=f,this.vertexShader=b,this.fragmentShader=w,this}let qf=0;class Yf{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t){const e=t.vertexShader,n=t.fragmentShader,s=this._getShaderStage(e),r=this._getShaderStage(n),o=this._getShaderCacheForMaterial(t);return o.has(s)===!1&&(o.add(s),s.usedTimes++),o.has(r)===!1&&(o.add(r),r.usedTimes++),this}remove(t){const e=this.materialCache.get(t);for(const n of e)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderID(t){return this._getShaderStage(t.vertexShader).id}getFragmentShaderID(t){return this._getShaderStage(t.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){const e=this.materialCache;let n=e.get(t);return n===void 0&&(n=new Set,e.set(t,n)),n}_getShaderStage(t){const e=this.shaderCache;let n=e.get(t);return n===void 0&&(n=new $f(t),e.set(t,n)),n}}class $f{constructor(t){this.id=qf++,this.code=t,this.usedTimes=0}}function jf(i,t,e,n,s,r,o){const a=new zo,l=new Yf,c=[],h=s.isWebGL2,d=s.logarithmicDepthBuffer,p=s.vertexTextures;let m=s.precision;const _={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function g(M){return M===0?"uv":`uv${M}`}function f(M,E,V,W,nt){const P=W.fog,H=nt.geometry,k=M.isMeshStandardMaterial?W.environment:null,Y=(M.isMeshStandardMaterial?e:t).get(M.envMap||k),X=Y&&Y.mapping===Ts?Y.image.height:null,q=_[M.type];M.precision!==null&&(m=s.getMaxPrecision(M.precision),m!==M.precision&&console.warn("THREE.WebGLProgram.getParameters:",M.precision,"not supported, using",m,"instead."));const j=H.morphAttributes.position||H.morphAttributes.normal||H.morphAttributes.color,et=j!==void 0?j.length:0;let it=0;H.morphAttributes.position!==void 0&&(it=1),H.morphAttributes.normal!==void 0&&(it=2),H.morphAttributes.color!==void 0&&(it=3);let G,K,ct,_t;if(q){const Se=Qe[q];G=Se.vertexShader,K=Se.fragmentShader}else G=M.vertexShader,K=M.fragmentShader,l.update(M),ct=l.getVertexShaderID(M),_t=l.getFragmentShaderID(M);const gt=i.getRenderTarget(),Ct=nt.isInstancedMesh===!0,Lt=nt.isBatchedMesh===!0,Et=!!M.map,Vt=!!M.matcap,N=!!Y,Me=!!M.aoMap,xt=!!M.lightMap,wt=!!M.bumpMap,ft=!!M.normalMap,te=!!M.displacementMap,Ut=!!M.emissiveMap,S=!!M.metalnessMap,v=!!M.roughnessMap,O=M.anisotropy>0,Q=M.clearcoat>0,J=M.iridescence>0,tt=M.sheen>0,pt=M.transmission>0,lt=O&&!!M.anisotropyMap,ut=Q&&!!M.clearcoatMap,yt=Q&&!!M.clearcoatNormalMap,Nt=Q&&!!M.clearcoatRoughnessMap,Z=J&&!!M.iridescenceMap,qt=J&&!!M.iridescenceThicknessMap,Ht=tt&&!!M.sheenColorMap,bt=tt&&!!M.sheenRoughnessMap,vt=!!M.specularMap,dt=!!M.specularColorMap,Dt=!!M.specularIntensityMap,Xt=pt&&!!M.transmissionMap,ne=pt&&!!M.thicknessMap,Ot=!!M.gradientMap,st=!!M.alphaMap,R=M.alphaTest>0,at=!!M.alphaHash,ot=!!M.extensions,Tt=!!H.attributes.uv1,Mt=!!H.attributes.uv2,jt=!!H.attributes.uv3;let Kt=Tn;return M.toneMapped&&(gt===null||gt.isXRRenderTarget===!0)&&(Kt=i.toneMapping),{isWebGL2:h,shaderID:q,shaderType:M.type,shaderName:M.name,vertexShader:G,fragmentShader:K,defines:M.defines,customVertexShaderID:ct,customFragmentShaderID:_t,isRawShaderMaterial:M.isRawShaderMaterial===!0,glslVersion:M.glslVersion,precision:m,batching:Lt,instancing:Ct,instancingColor:Ct&&nt.instanceColor!==null,supportsVertexTextures:p,outputColorSpace:gt===null?i.outputColorSpace:gt.isXRRenderTarget===!0?gt.texture.colorSpace:dn,map:Et,matcap:Vt,envMap:N,envMapMode:N&&Y.mapping,envMapCubeUVHeight:X,aoMap:Me,lightMap:xt,bumpMap:wt,normalMap:ft,displacementMap:p&&te,emissiveMap:Ut,normalMapObjectSpace:ft&&M.normalMapType===nc,normalMapTangentSpace:ft&&M.normalMapType===Lo,metalnessMap:S,roughnessMap:v,anisotropy:O,anisotropyMap:lt,clearcoat:Q,clearcoatMap:ut,clearcoatNormalMap:yt,clearcoatRoughnessMap:Nt,iridescence:J,iridescenceMap:Z,iridescenceThicknessMap:qt,sheen:tt,sheenColorMap:Ht,sheenRoughnessMap:bt,specularMap:vt,specularColorMap:dt,specularIntensityMap:Dt,transmission:pt,transmissionMap:Xt,thicknessMap:ne,gradientMap:Ot,opaque:M.transparent===!1&&M.blending===ci,alphaMap:st,alphaTest:R,alphaHash:at,combine:M.combine,mapUv:Et&&g(M.map.channel),aoMapUv:Me&&g(M.aoMap.channel),lightMapUv:xt&&g(M.lightMap.channel),bumpMapUv:wt&&g(M.bumpMap.channel),normalMapUv:ft&&g(M.normalMap.channel),displacementMapUv:te&&g(M.displacementMap.channel),emissiveMapUv:Ut&&g(M.emissiveMap.channel),metalnessMapUv:S&&g(M.metalnessMap.channel),roughnessMapUv:v&&g(M.roughnessMap.channel),anisotropyMapUv:lt&&g(M.anisotropyMap.channel),clearcoatMapUv:ut&&g(M.clearcoatMap.channel),clearcoatNormalMapUv:yt&&g(M.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Nt&&g(M.clearcoatRoughnessMap.channel),iridescenceMapUv:Z&&g(M.iridescenceMap.channel),iridescenceThicknessMapUv:qt&&g(M.iridescenceThicknessMap.channel),sheenColorMapUv:Ht&&g(M.sheenColorMap.channel),sheenRoughnessMapUv:bt&&g(M.sheenRoughnessMap.channel),specularMapUv:vt&&g(M.specularMap.channel),specularColorMapUv:dt&&g(M.specularColorMap.channel),specularIntensityMapUv:Dt&&g(M.specularIntensityMap.channel),transmissionMapUv:Xt&&g(M.transmissionMap.channel),thicknessMapUv:ne&&g(M.thicknessMap.channel),alphaMapUv:st&&g(M.alphaMap.channel),vertexTangents:!!H.attributes.tangent&&(ft||O),vertexColors:M.vertexColors,vertexAlphas:M.vertexColors===!0&&!!H.attributes.color&&H.attributes.color.itemSize===4,vertexUv1s:Tt,vertexUv2s:Mt,vertexUv3s:jt,pointsUvs:nt.isPoints===!0&&!!H.attributes.uv&&(Et||st),fog:!!P,useFog:M.fog===!0,fogExp2:P&&P.isFogExp2,flatShading:M.flatShading===!0,sizeAttenuation:M.sizeAttenuation===!0,logarithmicDepthBuffer:d,skinning:nt.isSkinnedMesh===!0,morphTargets:H.morphAttributes.position!==void 0,morphNormals:H.morphAttributes.normal!==void 0,morphColors:H.morphAttributes.color!==void 0,morphTargetsCount:et,morphTextureStride:it,numDirLights:E.directional.length,numPointLights:E.point.length,numSpotLights:E.spot.length,numSpotLightMaps:E.spotLightMap.length,numRectAreaLights:E.rectArea.length,numHemiLights:E.hemi.length,numDirLightShadows:E.directionalShadowMap.length,numPointLightShadows:E.pointShadowMap.length,numSpotLightShadows:E.spotShadowMap.length,numSpotLightShadowsWithMaps:E.numSpotLightShadowsWithMaps,numLightProbes:E.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:M.dithering,shadowMapEnabled:i.shadowMap.enabled&&V.length>0,shadowMapType:i.shadowMap.type,toneMapping:Kt,useLegacyLights:i._useLegacyLights,decodeVideoTexture:Et&&M.map.isVideoTexture===!0&&Yt.getTransfer(M.map.colorSpace)===Jt,premultipliedAlpha:M.premultipliedAlpha,doubleSided:M.side===tn,flipSided:M.side===be,useDepthPacking:M.depthPacking>=0,depthPacking:M.depthPacking||0,index0AttributeName:M.index0AttributeName,extensionDerivatives:ot&&M.extensions.derivatives===!0,extensionFragDepth:ot&&M.extensions.fragDepth===!0,extensionDrawBuffers:ot&&M.extensions.drawBuffers===!0,extensionShaderTextureLOD:ot&&M.extensions.shaderTextureLOD===!0,extensionClipCullDistance:ot&&M.extensions.clipCullDistance&&n.has("WEBGL_clip_cull_distance"),rendererExtensionFragDepth:h||n.has("EXT_frag_depth"),rendererExtensionDrawBuffers:h||n.has("WEBGL_draw_buffers"),rendererExtensionShaderTextureLod:h||n.has("EXT_shader_texture_lod"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:M.customProgramCacheKey()}}function u(M){const E=[];if(M.shaderID?E.push(M.shaderID):(E.push(M.customVertexShaderID),E.push(M.customFragmentShaderID)),M.defines!==void 0)for(const V in M.defines)E.push(V),E.push(M.defines[V]);return M.isRawShaderMaterial===!1&&(T(E,M),y(E,M),E.push(i.outputColorSpace)),E.push(M.customProgramCacheKey),E.join()}function T(M,E){M.push(E.precision),M.push(E.outputColorSpace),M.push(E.envMapMode),M.push(E.envMapCubeUVHeight),M.push(E.mapUv),M.push(E.alphaMapUv),M.push(E.lightMapUv),M.push(E.aoMapUv),M.push(E.bumpMapUv),M.push(E.normalMapUv),M.push(E.displacementMapUv),M.push(E.emissiveMapUv),M.push(E.metalnessMapUv),M.push(E.roughnessMapUv),M.push(E.anisotropyMapUv),M.push(E.clearcoatMapUv),M.push(E.clearcoatNormalMapUv),M.push(E.clearcoatRoughnessMapUv),M.push(E.iridescenceMapUv),M.push(E.iridescenceThicknessMapUv),M.push(E.sheenColorMapUv),M.push(E.sheenRoughnessMapUv),M.push(E.specularMapUv),M.push(E.specularColorMapUv),M.push(E.specularIntensityMapUv),M.push(E.transmissionMapUv),M.push(E.thicknessMapUv),M.push(E.combine),M.push(E.fogExp2),M.push(E.sizeAttenuation),M.push(E.morphTargetsCount),M.push(E.morphAttributeCount),M.push(E.numDirLights),M.push(E.numPointLights),M.push(E.numSpotLights),M.push(E.numSpotLightMaps),M.push(E.numHemiLights),M.push(E.numRectAreaLights),M.push(E.numDirLightShadows),M.push(E.numPointLightShadows),M.push(E.numSpotLightShadows),M.push(E.numSpotLightShadowsWithMaps),M.push(E.numLightProbes),M.push(E.shadowMapType),M.push(E.toneMapping),M.push(E.numClippingPlanes),M.push(E.numClipIntersection),M.push(E.depthPacking)}function y(M,E){a.disableAll(),E.isWebGL2&&a.enable(0),E.supportsVertexTextures&&a.enable(1),E.instancing&&a.enable(2),E.instancingColor&&a.enable(3),E.matcap&&a.enable(4),E.envMap&&a.enable(5),E.normalMapObjectSpace&&a.enable(6),E.normalMapTangentSpace&&a.enable(7),E.clearcoat&&a.enable(8),E.iridescence&&a.enable(9),E.alphaTest&&a.enable(10),E.vertexColors&&a.enable(11),E.vertexAlphas&&a.enable(12),E.vertexUv1s&&a.enable(13),E.vertexUv2s&&a.enable(14),E.vertexUv3s&&a.enable(15),E.vertexTangents&&a.enable(16),E.anisotropy&&a.enable(17),E.alphaHash&&a.enable(18),E.batching&&a.enable(19),M.push(a.mask),a.disableAll(),E.fog&&a.enable(0),E.useFog&&a.enable(1),E.flatShading&&a.enable(2),E.logarithmicDepthBuffer&&a.enable(3),E.skinning&&a.enable(4),E.morphTargets&&a.enable(5),E.morphNormals&&a.enable(6),E.morphColors&&a.enable(7),E.premultipliedAlpha&&a.enable(8),E.shadowMapEnabled&&a.enable(9),E.useLegacyLights&&a.enable(10),E.doubleSided&&a.enable(11),E.flipSided&&a.enable(12),E.useDepthPacking&&a.enable(13),E.dithering&&a.enable(14),E.transmission&&a.enable(15),E.sheen&&a.enable(16),E.opaque&&a.enable(17),E.pointsUvs&&a.enable(18),E.decodeVideoTexture&&a.enable(19),M.push(a.mask)}function A(M){const E=_[M.type];let V;if(E){const W=Qe[E];V=Cc.clone(W.uniforms)}else V=M.uniforms;return V}function C(M,E){let V;for(let W=0,nt=c.length;W<nt;W++){const P=c[W];if(P.cacheKey===E){V=P,++V.usedTimes;break}}return V===void 0&&(V=new Xf(i,E,M,r),c.push(V)),V}function b(M){if(--M.usedTimes===0){const E=c.indexOf(M);c[E]=c[c.length-1],c.pop(),M.destroy()}}function w(M){l.remove(M)}function $(){l.dispose()}return{getParameters:f,getProgramCacheKey:u,getUniforms:A,acquireProgram:C,releaseProgram:b,releaseShaderCache:w,programs:c,dispose:$}}function Kf(){let i=new WeakMap;function t(r){let o=i.get(r);return o===void 0&&(o={},i.set(r,o)),o}function e(r){i.delete(r)}function n(r,o,a){i.get(r)[o]=a}function s(){i=new WeakMap}return{get:t,remove:e,update:n,dispose:s}}function Zf(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.material.id!==t.material.id?i.material.id-t.material.id:i.z!==t.z?i.z-t.z:i.id-t.id}function no(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.z!==t.z?t.z-i.z:i.id-t.id}function io(){const i=[];let t=0;const e=[],n=[],s=[];function r(){t=0,e.length=0,n.length=0,s.length=0}function o(d,p,m,_,g,f){let u=i[t];return u===void 0?(u={id:d.id,object:d,geometry:p,material:m,groupOrder:_,renderOrder:d.renderOrder,z:g,group:f},i[t]=u):(u.id=d.id,u.object=d,u.geometry=p,u.material=m,u.groupOrder=_,u.renderOrder=d.renderOrder,u.z=g,u.group=f),t++,u}function a(d,p,m,_,g,f){const u=o(d,p,m,_,g,f);m.transmission>0?n.push(u):m.transparent===!0?s.push(u):e.push(u)}function l(d,p,m,_,g,f){const u=o(d,p,m,_,g,f);m.transmission>0?n.unshift(u):m.transparent===!0?s.unshift(u):e.unshift(u)}function c(d,p){e.length>1&&e.sort(d||Zf),n.length>1&&n.sort(p||no),s.length>1&&s.sort(p||no)}function h(){for(let d=t,p=i.length;d<p;d++){const m=i[d];if(m.id===null)break;m.id=null,m.object=null,m.geometry=null,m.material=null,m.group=null}}return{opaque:e,transmissive:n,transparent:s,init:r,push:a,unshift:l,finish:h,sort:c}}function Jf(){let i=new WeakMap;function t(n,s){const r=i.get(n);let o;return r===void 0?(o=new io,i.set(n,[o])):s>=r.length?(o=new io,r.push(o)):o=r[s],o}function e(){i=new WeakMap}return{get:t,dispose:e}}function Qf(){const i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"DirectionalLight":e={direction:new D,color:new Gt};break;case"SpotLight":e={position:new D,direction:new D,color:new Gt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new D,color:new Gt,distance:0,decay:0};break;case"HemisphereLight":e={direction:new D,skyColor:new Gt,groundColor:new Gt};break;case"RectAreaLight":e={color:new Gt,position:new D,halfWidth:new D,halfHeight:new D};break}return i[t.id]=e,e}}}function tp(){const i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"DirectionalLight":e={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new kt};break;case"SpotLight":e={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new kt};break;case"PointLight":e={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new kt,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[t.id]=e,e}}}let ep=0;function np(i,t){return(t.castShadow?2:0)-(i.castShadow?2:0)+(t.map?1:0)-(i.map?1:0)}function ip(i,t){const e=new Qf,n=tp(),s={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let h=0;h<9;h++)s.probe.push(new D);const r=new D,o=new re,a=new re;function l(h,d){let p=0,m=0,_=0;for(let W=0;W<9;W++)s.probe[W].set(0,0,0);let g=0,f=0,u=0,T=0,y=0,A=0,C=0,b=0,w=0,$=0,M=0;h.sort(np);const E=d===!0?Math.PI:1;for(let W=0,nt=h.length;W<nt;W++){const P=h[W],H=P.color,k=P.intensity,Y=P.distance,X=P.shadow&&P.shadow.map?P.shadow.map.texture:null;if(P.isAmbientLight)p+=H.r*k*E,m+=H.g*k*E,_+=H.b*k*E;else if(P.isLightProbe){for(let q=0;q<9;q++)s.probe[q].addScaledVector(P.sh.coefficients[q],k);M++}else if(P.isDirectionalLight){const q=e.get(P);if(q.color.copy(P.color).multiplyScalar(P.intensity*E),P.castShadow){const j=P.shadow,et=n.get(P);et.shadowBias=j.bias,et.shadowNormalBias=j.normalBias,et.shadowRadius=j.radius,et.shadowMapSize=j.mapSize,s.directionalShadow[g]=et,s.directionalShadowMap[g]=X,s.directionalShadowMatrix[g]=P.shadow.matrix,A++}s.directional[g]=q,g++}else if(P.isSpotLight){const q=e.get(P);q.position.setFromMatrixPosition(P.matrixWorld),q.color.copy(H).multiplyScalar(k*E),q.distance=Y,q.coneCos=Math.cos(P.angle),q.penumbraCos=Math.cos(P.angle*(1-P.penumbra)),q.decay=P.decay,s.spot[u]=q;const j=P.shadow;if(P.map&&(s.spotLightMap[w]=P.map,w++,j.updateMatrices(P),P.castShadow&&$++),s.spotLightMatrix[u]=j.matrix,P.castShadow){const et=n.get(P);et.shadowBias=j.bias,et.shadowNormalBias=j.normalBias,et.shadowRadius=j.radius,et.shadowMapSize=j.mapSize,s.spotShadow[u]=et,s.spotShadowMap[u]=X,b++}u++}else if(P.isRectAreaLight){const q=e.get(P);q.color.copy(H).multiplyScalar(k),q.halfWidth.set(P.width*.5,0,0),q.halfHeight.set(0,P.height*.5,0),s.rectArea[T]=q,T++}else if(P.isPointLight){const q=e.get(P);if(q.color.copy(P.color).multiplyScalar(P.intensity*E),q.distance=P.distance,q.decay=P.decay,P.castShadow){const j=P.shadow,et=n.get(P);et.shadowBias=j.bias,et.shadowNormalBias=j.normalBias,et.shadowRadius=j.radius,et.shadowMapSize=j.mapSize,et.shadowCameraNear=j.camera.near,et.shadowCameraFar=j.camera.far,s.pointShadow[f]=et,s.pointShadowMap[f]=X,s.pointShadowMatrix[f]=P.shadow.matrix,C++}s.point[f]=q,f++}else if(P.isHemisphereLight){const q=e.get(P);q.skyColor.copy(P.color).multiplyScalar(k*E),q.groundColor.copy(P.groundColor).multiplyScalar(k*E),s.hemi[y]=q,y++}}T>0&&(t.isWebGL2?i.has("OES_texture_float_linear")===!0?(s.rectAreaLTC1=rt.LTC_FLOAT_1,s.rectAreaLTC2=rt.LTC_FLOAT_2):(s.rectAreaLTC1=rt.LTC_HALF_1,s.rectAreaLTC2=rt.LTC_HALF_2):i.has("OES_texture_float_linear")===!0?(s.rectAreaLTC1=rt.LTC_FLOAT_1,s.rectAreaLTC2=rt.LTC_FLOAT_2):i.has("OES_texture_half_float_linear")===!0?(s.rectAreaLTC1=rt.LTC_HALF_1,s.rectAreaLTC2=rt.LTC_HALF_2):console.error("THREE.WebGLRenderer: Unable to use RectAreaLight. Missing WebGL extensions.")),s.ambient[0]=p,s.ambient[1]=m,s.ambient[2]=_;const V=s.hash;(V.directionalLength!==g||V.pointLength!==f||V.spotLength!==u||V.rectAreaLength!==T||V.hemiLength!==y||V.numDirectionalShadows!==A||V.numPointShadows!==C||V.numSpotShadows!==b||V.numSpotMaps!==w||V.numLightProbes!==M)&&(s.directional.length=g,s.spot.length=u,s.rectArea.length=T,s.point.length=f,s.hemi.length=y,s.directionalShadow.length=A,s.directionalShadowMap.length=A,s.pointShadow.length=C,s.pointShadowMap.length=C,s.spotShadow.length=b,s.spotShadowMap.length=b,s.directionalShadowMatrix.length=A,s.pointShadowMatrix.length=C,s.spotLightMatrix.length=b+w-$,s.spotLightMap.length=w,s.numSpotLightShadowsWithMaps=$,s.numLightProbes=M,V.directionalLength=g,V.pointLength=f,V.spotLength=u,V.rectAreaLength=T,V.hemiLength=y,V.numDirectionalShadows=A,V.numPointShadows=C,V.numSpotShadows=b,V.numSpotMaps=w,V.numLightProbes=M,s.version=ep++)}function c(h,d){let p=0,m=0,_=0,g=0,f=0;const u=d.matrixWorldInverse;for(let T=0,y=h.length;T<y;T++){const A=h[T];if(A.isDirectionalLight){const C=s.directional[p];C.direction.setFromMatrixPosition(A.matrixWorld),r.setFromMatrixPosition(A.target.matrixWorld),C.direction.sub(r),C.direction.transformDirection(u),p++}else if(A.isSpotLight){const C=s.spot[_];C.position.setFromMatrixPosition(A.matrixWorld),C.position.applyMatrix4(u),C.direction.setFromMatrixPosition(A.matrixWorld),r.setFromMatrixPosition(A.target.matrixWorld),C.direction.sub(r),C.direction.transformDirection(u),_++}else if(A.isRectAreaLight){const C=s.rectArea[g];C.position.setFromMatrixPosition(A.matrixWorld),C.position.applyMatrix4(u),a.identity(),o.copy(A.matrixWorld),o.premultiply(u),a.extractRotation(o),C.halfWidth.set(A.width*.5,0,0),C.halfHeight.set(0,A.height*.5,0),C.halfWidth.applyMatrix4(a),C.halfHeight.applyMatrix4(a),g++}else if(A.isPointLight){const C=s.point[m];C.position.setFromMatrixPosition(A.matrixWorld),C.position.applyMatrix4(u),m++}else if(A.isHemisphereLight){const C=s.hemi[f];C.direction.setFromMatrixPosition(A.matrixWorld),C.direction.transformDirection(u),f++}}}return{setup:l,setupView:c,state:s}}function so(i,t){const e=new ip(i,t),n=[],s=[];function r(){n.length=0,s.length=0}function o(d){n.push(d)}function a(d){s.push(d)}function l(d){e.setup(n,d)}function c(d){e.setupView(n,d)}return{init:r,state:{lightsArray:n,shadowsArray:s,lights:e},setupLights:l,setupLightsView:c,pushLight:o,pushShadow:a}}function sp(i,t){let e=new WeakMap;function n(r,o=0){const a=e.get(r);let l;return a===void 0?(l=new so(i,t),e.set(r,[l])):o>=a.length?(l=new so(i,t),a.push(l)):l=a[o],l}function s(){e=new WeakMap}return{get:n,dispose:s}}class rp extends un{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=tc,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}}class ap extends un{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}}const op=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,lp=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function cp(i,t,e){let n=new Rr;const s=new kt,r=new kt,o=new Qt,a=new rp({depthPacking:ec}),l=new ap,c={},h=e.maxTextureSize,d={[bn]:be,[be]:bn,[tn]:tn},p=new fn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new kt},radius:{value:4}},vertexShader:op,fragmentShader:lp}),m=p.clone();m.defines.HORIZONTAL_PASS=1;const _=new Ke;_.setAttribute("position",new Ae(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const g=new $e(_,p),f=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=xo;let u=this.type;this.render=function(b,w,$){if(f.enabled===!1||f.autoUpdate===!1&&f.needsUpdate===!1||b.length===0)return;const M=i.getRenderTarget(),E=i.getActiveCubeFace(),V=i.getActiveMipmapLevel(),W=i.state;W.setBlending(En),W.buffers.color.setClear(1,1,1,1),W.buffers.depth.setTest(!0),W.setScissorTest(!1);const nt=u!==ln&&this.type===ln,P=u===ln&&this.type!==ln;for(let H=0,k=b.length;H<k;H++){const Y=b[H],X=Y.shadow;if(X===void 0){console.warn("THREE.WebGLShadowMap:",Y,"has no shadow.");continue}if(X.autoUpdate===!1&&X.needsUpdate===!1)continue;s.copy(X.mapSize);const q=X.getFrameExtents();if(s.multiply(q),r.copy(X.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/q.x),s.x=r.x*q.x,X.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/q.y),s.y=r.y*q.y,X.mapSize.y=r.y)),X.map===null||nt===!0||P===!0){const et=this.type!==ln?{minFilter:Te,magFilter:Te}:{};X.map!==null&&X.map.dispose(),X.map=new Hn(s.x,s.y,et),X.map.texture.name=Y.name+".shadowMap",X.camera.updateProjectionMatrix()}i.setRenderTarget(X.map),i.clear();const j=X.getViewportCount();for(let et=0;et<j;et++){const it=X.getViewport(et);o.set(r.x*it.x,r.y*it.y,r.x*it.z,r.y*it.w),W.viewport(o),X.updateMatrices(Y,et),n=X.getFrustum(),A(w,$,X.camera,Y,this.type)}X.isPointLightShadow!==!0&&this.type===ln&&T(X,$),X.needsUpdate=!1}u=this.type,f.needsUpdate=!1,i.setRenderTarget(M,E,V)};function T(b,w){const $=t.update(g);p.defines.VSM_SAMPLES!==b.blurSamples&&(p.defines.VSM_SAMPLES=b.blurSamples,m.defines.VSM_SAMPLES=b.blurSamples,p.needsUpdate=!0,m.needsUpdate=!0),b.mapPass===null&&(b.mapPass=new Hn(s.x,s.y)),p.uniforms.shadow_pass.value=b.map.texture,p.uniforms.resolution.value=b.mapSize,p.uniforms.radius.value=b.radius,i.setRenderTarget(b.mapPass),i.clear(),i.renderBufferDirect(w,null,$,p,g,null),m.uniforms.shadow_pass.value=b.mapPass.texture,m.uniforms.resolution.value=b.mapSize,m.uniforms.radius.value=b.radius,i.setRenderTarget(b.map),i.clear(),i.renderBufferDirect(w,null,$,m,g,null)}function y(b,w,$,M){let E=null;const V=$.isPointLight===!0?b.customDistanceMaterial:b.customDepthMaterial;if(V!==void 0)E=V;else if(E=$.isPointLight===!0?l:a,i.localClippingEnabled&&w.clipShadows===!0&&Array.isArray(w.clippingPlanes)&&w.clippingPlanes.length!==0||w.displacementMap&&w.displacementScale!==0||w.alphaMap&&w.alphaTest>0||w.map&&w.alphaTest>0){const W=E.uuid,nt=w.uuid;let P=c[W];P===void 0&&(P={},c[W]=P);let H=P[nt];H===void 0&&(H=E.clone(),P[nt]=H,w.addEventListener("dispose",C)),E=H}if(E.visible=w.visible,E.wireframe=w.wireframe,M===ln?E.side=w.shadowSide!==null?w.shadowSide:w.side:E.side=w.shadowSide!==null?w.shadowSide:d[w.side],E.alphaMap=w.alphaMap,E.alphaTest=w.alphaTest,E.map=w.map,E.clipShadows=w.clipShadows,E.clippingPlanes=w.clippingPlanes,E.clipIntersection=w.clipIntersection,E.displacementMap=w.displacementMap,E.displacementScale=w.displacementScale,E.displacementBias=w.displacementBias,E.wireframeLinewidth=w.wireframeLinewidth,E.linewidth=w.linewidth,$.isPointLight===!0&&E.isMeshDistanceMaterial===!0){const W=i.properties.get(E);W.light=$}return E}function A(b,w,$,M,E){if(b.visible===!1)return;if(b.layers.test(w.layers)&&(b.isMesh||b.isLine||b.isPoints)&&(b.castShadow||b.receiveShadow&&E===ln)&&(!b.frustumCulled||n.intersectsObject(b))){b.modelViewMatrix.multiplyMatrices($.matrixWorldInverse,b.matrixWorld);const nt=t.update(b),P=b.material;if(Array.isArray(P)){const H=nt.groups;for(let k=0,Y=H.length;k<Y;k++){const X=H[k],q=P[X.materialIndex];if(q&&q.visible){const j=y(b,q,M,E);b.onBeforeShadow(i,b,w,$,nt,j,X),i.renderBufferDirect($,null,nt,j,b,X),b.onAfterShadow(i,b,w,$,nt,j,X)}}}else if(P.visible){const H=y(b,P,M,E);b.onBeforeShadow(i,b,w,$,nt,H,null),i.renderBufferDirect($,null,nt,H,b,null),b.onAfterShadow(i,b,w,$,nt,H,null)}}const W=b.children;for(let nt=0,P=W.length;nt<P;nt++)A(W[nt],w,$,M,E)}function C(b){b.target.removeEventListener("dispose",C);for(const $ in c){const M=c[$],E=b.target.uuid;E in M&&(M[E].dispose(),delete M[E])}}}function hp(i,t,e){const n=e.isWebGL2;function s(){let R=!1;const at=new Qt;let ot=null;const Tt=new Qt(0,0,0,0);return{setMask:function(Mt){ot!==Mt&&!R&&(i.colorMask(Mt,Mt,Mt,Mt),ot=Mt)},setLocked:function(Mt){R=Mt},setClear:function(Mt,jt,Kt,ce,Se){Se===!0&&(Mt*=ce,jt*=ce,Kt*=ce),at.set(Mt,jt,Kt,ce),Tt.equals(at)===!1&&(i.clearColor(Mt,jt,Kt,ce),Tt.copy(at))},reset:function(){R=!1,ot=null,Tt.set(-1,0,0,0)}}}function r(){let R=!1,at=null,ot=null,Tt=null;return{setTest:function(Mt){Mt?Lt(i.DEPTH_TEST):Et(i.DEPTH_TEST)},setMask:function(Mt){at!==Mt&&!R&&(i.depthMask(Mt),at=Mt)},setFunc:function(Mt){if(ot!==Mt){switch(Mt){case Ll:i.depthFunc(i.NEVER);break;case Dl:i.depthFunc(i.ALWAYS);break;case Il:i.depthFunc(i.LESS);break;case ms:i.depthFunc(i.LEQUAL);break;case Ul:i.depthFunc(i.EQUAL);break;case Nl:i.depthFunc(i.GEQUAL);break;case Fl:i.depthFunc(i.GREATER);break;case Ol:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}ot=Mt}},setLocked:function(Mt){R=Mt},setClear:function(Mt){Tt!==Mt&&(i.clearDepth(Mt),Tt=Mt)},reset:function(){R=!1,at=null,ot=null,Tt=null}}}function o(){let R=!1,at=null,ot=null,Tt=null,Mt=null,jt=null,Kt=null,ce=null,Se=null;return{setTest:function(Zt){R||(Zt?Lt(i.STENCIL_TEST):Et(i.STENCIL_TEST))},setMask:function(Zt){at!==Zt&&!R&&(i.stencilMask(Zt),at=Zt)},setFunc:function(Zt,ye,Ze){(ot!==Zt||Tt!==ye||Mt!==Ze)&&(i.stencilFunc(Zt,ye,Ze),ot=Zt,Tt=ye,Mt=Ze)},setOp:function(Zt,ye,Ze){(jt!==Zt||Kt!==ye||ce!==Ze)&&(i.stencilOp(Zt,ye,Ze),jt=Zt,Kt=ye,ce=Ze)},setLocked:function(Zt){R=Zt},setClear:function(Zt){Se!==Zt&&(i.clearStencil(Zt),Se=Zt)},reset:function(){R=!1,at=null,ot=null,Tt=null,Mt=null,jt=null,Kt=null,ce=null,Se=null}}}const a=new s,l=new r,c=new o,h=new WeakMap,d=new WeakMap;let p={},m={},_=new WeakMap,g=[],f=null,u=!1,T=null,y=null,A=null,C=null,b=null,w=null,$=null,M=new Gt(0,0,0),E=0,V=!1,W=null,nt=null,P=null,H=null,k=null;const Y=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let X=!1,q=0;const j=i.getParameter(i.VERSION);j.indexOf("WebGL")!==-1?(q=parseFloat(/^WebGL (\d)/.exec(j)[1]),X=q>=1):j.indexOf("OpenGL ES")!==-1&&(q=parseFloat(/^OpenGL ES (\d)/.exec(j)[1]),X=q>=2);let et=null,it={};const G=i.getParameter(i.SCISSOR_BOX),K=i.getParameter(i.VIEWPORT),ct=new Qt().fromArray(G),_t=new Qt().fromArray(K);function gt(R,at,ot,Tt){const Mt=new Uint8Array(4),jt=i.createTexture();i.bindTexture(R,jt),i.texParameteri(R,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(R,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Kt=0;Kt<ot;Kt++)n&&(R===i.TEXTURE_3D||R===i.TEXTURE_2D_ARRAY)?i.texImage3D(at,0,i.RGBA,1,1,Tt,0,i.RGBA,i.UNSIGNED_BYTE,Mt):i.texImage2D(at+Kt,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,Mt);return jt}const Ct={};Ct[i.TEXTURE_2D]=gt(i.TEXTURE_2D,i.TEXTURE_2D,1),Ct[i.TEXTURE_CUBE_MAP]=gt(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),n&&(Ct[i.TEXTURE_2D_ARRAY]=gt(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),Ct[i.TEXTURE_3D]=gt(i.TEXTURE_3D,i.TEXTURE_3D,1,1)),a.setClear(0,0,0,1),l.setClear(1),c.setClear(0),Lt(i.DEPTH_TEST),l.setFunc(ms),Ut(!1),S(Hr),Lt(i.CULL_FACE),ft(En);function Lt(R){p[R]!==!0&&(i.enable(R),p[R]=!0)}function Et(R){p[R]!==!1&&(i.disable(R),p[R]=!1)}function Vt(R,at){return m[R]!==at?(i.bindFramebuffer(R,at),m[R]=at,n&&(R===i.DRAW_FRAMEBUFFER&&(m[i.FRAMEBUFFER]=at),R===i.FRAMEBUFFER&&(m[i.DRAW_FRAMEBUFFER]=at)),!0):!1}function N(R,at){let ot=g,Tt=!1;if(R)if(ot=_.get(at),ot===void 0&&(ot=[],_.set(at,ot)),R.isWebGLMultipleRenderTargets){const Mt=R.texture;if(ot.length!==Mt.length||ot[0]!==i.COLOR_ATTACHMENT0){for(let jt=0,Kt=Mt.length;jt<Kt;jt++)ot[jt]=i.COLOR_ATTACHMENT0+jt;ot.length=Mt.length,Tt=!0}}else ot[0]!==i.COLOR_ATTACHMENT0&&(ot[0]=i.COLOR_ATTACHMENT0,Tt=!0);else ot[0]!==i.BACK&&(ot[0]=i.BACK,Tt=!0);Tt&&(e.isWebGL2?i.drawBuffers(ot):t.get("WEBGL_draw_buffers").drawBuffersWEBGL(ot))}function Me(R){return f!==R?(i.useProgram(R),f=R,!0):!1}const xt={[Nn]:i.FUNC_ADD,[gl]:i.FUNC_SUBTRACT,[_l]:i.FUNC_REVERSE_SUBTRACT};if(n)xt[kr]=i.MIN,xt[Wr]=i.MAX;else{const R=t.get("EXT_blend_minmax");R!==null&&(xt[kr]=R.MIN_EXT,xt[Wr]=R.MAX_EXT)}const wt={[vl]:i.ZERO,[xl]:i.ONE,[Ml]:i.SRC_COLOR,[dr]:i.SRC_ALPHA,[bl]:i.SRC_ALPHA_SATURATE,[Tl]:i.DST_COLOR,[yl]:i.DST_ALPHA,[Sl]:i.ONE_MINUS_SRC_COLOR,[fr]:i.ONE_MINUS_SRC_ALPHA,[Al]:i.ONE_MINUS_DST_COLOR,[El]:i.ONE_MINUS_DST_ALPHA,[wl]:i.CONSTANT_COLOR,[Rl]:i.ONE_MINUS_CONSTANT_COLOR,[Cl]:i.CONSTANT_ALPHA,[Pl]:i.ONE_MINUS_CONSTANT_ALPHA};function ft(R,at,ot,Tt,Mt,jt,Kt,ce,Se,Zt){if(R===En){u===!0&&(Et(i.BLEND),u=!1);return}if(u===!1&&(Lt(i.BLEND),u=!0),R!==ml){if(R!==T||Zt!==V){if((y!==Nn||b!==Nn)&&(i.blendEquation(i.FUNC_ADD),y=Nn,b=Nn),Zt)switch(R){case ci:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case ps:i.blendFunc(i.ONE,i.ONE);break;case Gr:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Vr:i.blendFuncSeparate(i.ZERO,i.SRC_COLOR,i.ZERO,i.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",R);break}else switch(R){case ci:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case ps:i.blendFunc(i.SRC_ALPHA,i.ONE);break;case Gr:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Vr:i.blendFunc(i.ZERO,i.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",R);break}A=null,C=null,w=null,$=null,M.set(0,0,0),E=0,T=R,V=Zt}return}Mt=Mt||at,jt=jt||ot,Kt=Kt||Tt,(at!==y||Mt!==b)&&(i.blendEquationSeparate(xt[at],xt[Mt]),y=at,b=Mt),(ot!==A||Tt!==C||jt!==w||Kt!==$)&&(i.blendFuncSeparate(wt[ot],wt[Tt],wt[jt],wt[Kt]),A=ot,C=Tt,w=jt,$=Kt),(ce.equals(M)===!1||Se!==E)&&(i.blendColor(ce.r,ce.g,ce.b,Se),M.copy(ce),E=Se),T=R,V=!1}function te(R,at){R.side===tn?Et(i.CULL_FACE):Lt(i.CULL_FACE);let ot=R.side===be;at&&(ot=!ot),Ut(ot),R.blending===ci&&R.transparent===!1?ft(En):ft(R.blending,R.blendEquation,R.blendSrc,R.blendDst,R.blendEquationAlpha,R.blendSrcAlpha,R.blendDstAlpha,R.blendColor,R.blendAlpha,R.premultipliedAlpha),l.setFunc(R.depthFunc),l.setTest(R.depthTest),l.setMask(R.depthWrite),a.setMask(R.colorWrite);const Tt=R.stencilWrite;c.setTest(Tt),Tt&&(c.setMask(R.stencilWriteMask),c.setFunc(R.stencilFunc,R.stencilRef,R.stencilFuncMask),c.setOp(R.stencilFail,R.stencilZFail,R.stencilZPass)),O(R.polygonOffset,R.polygonOffsetFactor,R.polygonOffsetUnits),R.alphaToCoverage===!0?Lt(i.SAMPLE_ALPHA_TO_COVERAGE):Et(i.SAMPLE_ALPHA_TO_COVERAGE)}function Ut(R){W!==R&&(R?i.frontFace(i.CW):i.frontFace(i.CCW),W=R)}function S(R){R!==dl?(Lt(i.CULL_FACE),R!==nt&&(R===Hr?i.cullFace(i.BACK):R===fl?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):Et(i.CULL_FACE),nt=R}function v(R){R!==P&&(X&&i.lineWidth(R),P=R)}function O(R,at,ot){R?(Lt(i.POLYGON_OFFSET_FILL),(H!==at||k!==ot)&&(i.polygonOffset(at,ot),H=at,k=ot)):Et(i.POLYGON_OFFSET_FILL)}function Q(R){R?Lt(i.SCISSOR_TEST):Et(i.SCISSOR_TEST)}function J(R){R===void 0&&(R=i.TEXTURE0+Y-1),et!==R&&(i.activeTexture(R),et=R)}function tt(R,at,ot){ot===void 0&&(et===null?ot=i.TEXTURE0+Y-1:ot=et);let Tt=it[ot];Tt===void 0&&(Tt={type:void 0,texture:void 0},it[ot]=Tt),(Tt.type!==R||Tt.texture!==at)&&(et!==ot&&(i.activeTexture(ot),et=ot),i.bindTexture(R,at||Ct[R]),Tt.type=R,Tt.texture=at)}function pt(){const R=it[et];R!==void 0&&R.type!==void 0&&(i.bindTexture(R.type,null),R.type=void 0,R.texture=void 0)}function lt(){try{i.compressedTexImage2D.apply(i,arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function ut(){try{i.compressedTexImage3D.apply(i,arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function yt(){try{i.texSubImage2D.apply(i,arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function Nt(){try{i.texSubImage3D.apply(i,arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function Z(){try{i.compressedTexSubImage2D.apply(i,arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function qt(){try{i.compressedTexSubImage3D.apply(i,arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function Ht(){try{i.texStorage2D.apply(i,arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function bt(){try{i.texStorage3D.apply(i,arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function vt(){try{i.texImage2D.apply(i,arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function dt(){try{i.texImage3D.apply(i,arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function Dt(R){ct.equals(R)===!1&&(i.scissor(R.x,R.y,R.z,R.w),ct.copy(R))}function Xt(R){_t.equals(R)===!1&&(i.viewport(R.x,R.y,R.z,R.w),_t.copy(R))}function ne(R,at){let ot=d.get(at);ot===void 0&&(ot=new WeakMap,d.set(at,ot));let Tt=ot.get(R);Tt===void 0&&(Tt=i.getUniformBlockIndex(at,R.name),ot.set(R,Tt))}function Ot(R,at){const Tt=d.get(at).get(R);h.get(at)!==Tt&&(i.uniformBlockBinding(at,Tt,R.__bindingPointIndex),h.set(at,Tt))}function st(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),n===!0&&(i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null)),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),p={},et=null,it={},m={},_=new WeakMap,g=[],f=null,u=!1,T=null,y=null,A=null,C=null,b=null,w=null,$=null,M=new Gt(0,0,0),E=0,V=!1,W=null,nt=null,P=null,H=null,k=null,ct.set(0,0,i.canvas.width,i.canvas.height),_t.set(0,0,i.canvas.width,i.canvas.height),a.reset(),l.reset(),c.reset()}return{buffers:{color:a,depth:l,stencil:c},enable:Lt,disable:Et,bindFramebuffer:Vt,drawBuffers:N,useProgram:Me,setBlending:ft,setMaterial:te,setFlipSided:Ut,setCullFace:S,setLineWidth:v,setPolygonOffset:O,setScissorTest:Q,activeTexture:J,bindTexture:tt,unbindTexture:pt,compressedTexImage2D:lt,compressedTexImage3D:ut,texImage2D:vt,texImage3D:dt,updateUBOMapping:ne,uniformBlockBinding:Ot,texStorage2D:Ht,texStorage3D:bt,texSubImage2D:yt,texSubImage3D:Nt,compressedTexSubImage2D:Z,compressedTexSubImage3D:qt,scissor:Dt,viewport:Xt,reset:st}}function up(i,t,e,n,s,r,o){const a=s.isWebGL2,l=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),h=new WeakMap;let d;const p=new WeakMap;let m=!1;try{m=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function _(S,v){return m?new OffscreenCanvas(S,v):Ms("canvas")}function g(S,v,O,Q){let J=1;if((S.width>Q||S.height>Q)&&(J=Q/Math.max(S.width,S.height)),J<1||v===!0)if(typeof HTMLImageElement<"u"&&S instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&S instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&S instanceof ImageBitmap){const tt=v?Mr:Math.floor,pt=tt(J*S.width),lt=tt(J*S.height);d===void 0&&(d=_(pt,lt));const ut=O?_(pt,lt):d;return ut.width=pt,ut.height=lt,ut.getContext("2d").drawImage(S,0,0,pt,lt),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+S.width+"x"+S.height+") to ("+pt+"x"+lt+")."),ut}else return"data"in S&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+S.width+"x"+S.height+")."),S;return S}function f(S){return Ma(S.width)&&Ma(S.height)}function u(S){return a?!1:S.wrapS!==He||S.wrapT!==He||S.minFilter!==Te&&S.minFilter!==ze}function T(S,v){return S.generateMipmaps&&v&&S.minFilter!==Te&&S.minFilter!==ze}function y(S){i.generateMipmap(S)}function A(S,v,O,Q,J=!1){if(a===!1)return v;if(S!==null){if(i[S]!==void 0)return i[S];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+S+"'")}let tt=v;if(v===i.RED&&(O===i.FLOAT&&(tt=i.R32F),O===i.HALF_FLOAT&&(tt=i.R16F),O===i.UNSIGNED_BYTE&&(tt=i.R8)),v===i.RED_INTEGER&&(O===i.UNSIGNED_BYTE&&(tt=i.R8UI),O===i.UNSIGNED_SHORT&&(tt=i.R16UI),O===i.UNSIGNED_INT&&(tt=i.R32UI),O===i.BYTE&&(tt=i.R8I),O===i.SHORT&&(tt=i.R16I),O===i.INT&&(tt=i.R32I)),v===i.RG&&(O===i.FLOAT&&(tt=i.RG32F),O===i.HALF_FLOAT&&(tt=i.RG16F),O===i.UNSIGNED_BYTE&&(tt=i.RG8)),v===i.RGBA){const pt=J?gs:Yt.getTransfer(Q);O===i.FLOAT&&(tt=i.RGBA32F),O===i.HALF_FLOAT&&(tt=i.RGBA16F),O===i.UNSIGNED_BYTE&&(tt=pt===Jt?i.SRGB8_ALPHA8:i.RGBA8),O===i.UNSIGNED_SHORT_4_4_4_4&&(tt=i.RGBA4),O===i.UNSIGNED_SHORT_5_5_5_1&&(tt=i.RGB5_A1)}return(tt===i.R16F||tt===i.R32F||tt===i.RG16F||tt===i.RG32F||tt===i.RGBA16F||tt===i.RGBA32F)&&t.get("EXT_color_buffer_float"),tt}function C(S,v,O){return T(S,O)===!0||S.isFramebufferTexture&&S.minFilter!==Te&&S.minFilter!==ze?Math.log2(Math.max(v.width,v.height))+1:S.mipmaps!==void 0&&S.mipmaps.length>0?S.mipmaps.length:S.isCompressedTexture&&Array.isArray(S.image)?v.mipmaps.length:1}function b(S){return S===Te||S===Xr||S===Ds?i.NEAREST:i.LINEAR}function w(S){const v=S.target;v.removeEventListener("dispose",w),M(v),v.isVideoTexture&&h.delete(v)}function $(S){const v=S.target;v.removeEventListener("dispose",$),V(v)}function M(S){const v=n.get(S);if(v.__webglInit===void 0)return;const O=S.source,Q=p.get(O);if(Q){const J=Q[v.__cacheKey];J.usedTimes--,J.usedTimes===0&&E(S),Object.keys(Q).length===0&&p.delete(O)}n.remove(S)}function E(S){const v=n.get(S);i.deleteTexture(v.__webglTexture);const O=S.source,Q=p.get(O);delete Q[v.__cacheKey],o.memory.textures--}function V(S){const v=S.texture,O=n.get(S),Q=n.get(v);if(Q.__webglTexture!==void 0&&(i.deleteTexture(Q.__webglTexture),o.memory.textures--),S.depthTexture&&S.depthTexture.dispose(),S.isWebGLCubeRenderTarget)for(let J=0;J<6;J++){if(Array.isArray(O.__webglFramebuffer[J]))for(let tt=0;tt<O.__webglFramebuffer[J].length;tt++)i.deleteFramebuffer(O.__webglFramebuffer[J][tt]);else i.deleteFramebuffer(O.__webglFramebuffer[J]);O.__webglDepthbuffer&&i.deleteRenderbuffer(O.__webglDepthbuffer[J])}else{if(Array.isArray(O.__webglFramebuffer))for(let J=0;J<O.__webglFramebuffer.length;J++)i.deleteFramebuffer(O.__webglFramebuffer[J]);else i.deleteFramebuffer(O.__webglFramebuffer);if(O.__webglDepthbuffer&&i.deleteRenderbuffer(O.__webglDepthbuffer),O.__webglMultisampledFramebuffer&&i.deleteFramebuffer(O.__webglMultisampledFramebuffer),O.__webglColorRenderbuffer)for(let J=0;J<O.__webglColorRenderbuffer.length;J++)O.__webglColorRenderbuffer[J]&&i.deleteRenderbuffer(O.__webglColorRenderbuffer[J]);O.__webglDepthRenderbuffer&&i.deleteRenderbuffer(O.__webglDepthRenderbuffer)}if(S.isWebGLMultipleRenderTargets)for(let J=0,tt=v.length;J<tt;J++){const pt=n.get(v[J]);pt.__webglTexture&&(i.deleteTexture(pt.__webglTexture),o.memory.textures--),n.remove(v[J])}n.remove(v),n.remove(S)}let W=0;function nt(){W=0}function P(){const S=W;return S>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+S+" texture units while this GPU supports only "+s.maxTextures),W+=1,S}function H(S){const v=[];return v.push(S.wrapS),v.push(S.wrapT),v.push(S.wrapR||0),v.push(S.magFilter),v.push(S.minFilter),v.push(S.anisotropy),v.push(S.internalFormat),v.push(S.format),v.push(S.type),v.push(S.generateMipmaps),v.push(S.premultiplyAlpha),v.push(S.flipY),v.push(S.unpackAlignment),v.push(S.colorSpace),v.join()}function k(S,v){const O=n.get(S);if(S.isVideoTexture&&te(S),S.isRenderTargetTexture===!1&&S.version>0&&O.__version!==S.version){const Q=S.image;if(Q===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(Q.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{ct(O,S,v);return}}e.bindTexture(i.TEXTURE_2D,O.__webglTexture,i.TEXTURE0+v)}function Y(S,v){const O=n.get(S);if(S.version>0&&O.__version!==S.version){ct(O,S,v);return}e.bindTexture(i.TEXTURE_2D_ARRAY,O.__webglTexture,i.TEXTURE0+v)}function X(S,v){const O=n.get(S);if(S.version>0&&O.__version!==S.version){ct(O,S,v);return}e.bindTexture(i.TEXTURE_3D,O.__webglTexture,i.TEXTURE0+v)}function q(S,v){const O=n.get(S);if(S.version>0&&O.__version!==S.version){_t(O,S,v);return}e.bindTexture(i.TEXTURE_CUBE_MAP,O.__webglTexture,i.TEXTURE0+v)}const j={[gr]:i.REPEAT,[He]:i.CLAMP_TO_EDGE,[_r]:i.MIRRORED_REPEAT},et={[Te]:i.NEAREST,[Xr]:i.NEAREST_MIPMAP_NEAREST,[Ds]:i.NEAREST_MIPMAP_LINEAR,[ze]:i.LINEAR,[Xl]:i.LINEAR_MIPMAP_NEAREST,[Di]:i.LINEAR_MIPMAP_LINEAR},it={[ic]:i.NEVER,[cc]:i.ALWAYS,[sc]:i.LESS,[Do]:i.LEQUAL,[rc]:i.EQUAL,[lc]:i.GEQUAL,[ac]:i.GREATER,[oc]:i.NOTEQUAL};function G(S,v,O){if(O?(i.texParameteri(S,i.TEXTURE_WRAP_S,j[v.wrapS]),i.texParameteri(S,i.TEXTURE_WRAP_T,j[v.wrapT]),(S===i.TEXTURE_3D||S===i.TEXTURE_2D_ARRAY)&&i.texParameteri(S,i.TEXTURE_WRAP_R,j[v.wrapR]),i.texParameteri(S,i.TEXTURE_MAG_FILTER,et[v.magFilter]),i.texParameteri(S,i.TEXTURE_MIN_FILTER,et[v.minFilter])):(i.texParameteri(S,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(S,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE),(S===i.TEXTURE_3D||S===i.TEXTURE_2D_ARRAY)&&i.texParameteri(S,i.TEXTURE_WRAP_R,i.CLAMP_TO_EDGE),(v.wrapS!==He||v.wrapT!==He)&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.wrapS and Texture.wrapT should be set to THREE.ClampToEdgeWrapping."),i.texParameteri(S,i.TEXTURE_MAG_FILTER,b(v.magFilter)),i.texParameteri(S,i.TEXTURE_MIN_FILTER,b(v.minFilter)),v.minFilter!==Te&&v.minFilter!==ze&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.minFilter should be set to THREE.NearestFilter or THREE.LinearFilter.")),v.compareFunction&&(i.texParameteri(S,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(S,i.TEXTURE_COMPARE_FUNC,it[v.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){const Q=t.get("EXT_texture_filter_anisotropic");if(v.magFilter===Te||v.minFilter!==Ds&&v.minFilter!==Di||v.type===Sn&&t.has("OES_texture_float_linear")===!1||a===!1&&v.type===Ii&&t.has("OES_texture_half_float_linear")===!1)return;(v.anisotropy>1||n.get(v).__currentAnisotropy)&&(i.texParameterf(S,Q.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(v.anisotropy,s.getMaxAnisotropy())),n.get(v).__currentAnisotropy=v.anisotropy)}}function K(S,v){let O=!1;S.__webglInit===void 0&&(S.__webglInit=!0,v.addEventListener("dispose",w));const Q=v.source;let J=p.get(Q);J===void 0&&(J={},p.set(Q,J));const tt=H(v);if(tt!==S.__cacheKey){J[tt]===void 0&&(J[tt]={texture:i.createTexture(),usedTimes:0},o.memory.textures++,O=!0),J[tt].usedTimes++;const pt=J[S.__cacheKey];pt!==void 0&&(J[S.__cacheKey].usedTimes--,pt.usedTimes===0&&E(v)),S.__cacheKey=tt,S.__webglTexture=J[tt].texture}return O}function ct(S,v,O){let Q=i.TEXTURE_2D;(v.isDataArrayTexture||v.isCompressedArrayTexture)&&(Q=i.TEXTURE_2D_ARRAY),v.isData3DTexture&&(Q=i.TEXTURE_3D);const J=K(S,v),tt=v.source;e.bindTexture(Q,S.__webglTexture,i.TEXTURE0+O);const pt=n.get(tt);if(tt.version!==pt.__version||J===!0){e.activeTexture(i.TEXTURE0+O);const lt=Yt.getPrimaries(Yt.workingColorSpace),ut=v.colorSpace===Ge?null:Yt.getPrimaries(v.colorSpace),yt=v.colorSpace===Ge||lt===ut?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,v.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,v.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,v.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,yt);const Nt=u(v)&&f(v.image)===!1;let Z=g(v.image,Nt,!1,s.maxTextureSize);Z=Ut(v,Z);const qt=f(Z)||a,Ht=r.convert(v.format,v.colorSpace);let bt=r.convert(v.type),vt=A(v.internalFormat,Ht,bt,v.colorSpace,v.isVideoTexture);G(Q,v,qt);let dt;const Dt=v.mipmaps,Xt=a&&v.isVideoTexture!==!0&&vt!==Co,ne=pt.__version===void 0||J===!0,Ot=C(v,Z,qt);if(v.isDepthTexture)vt=i.DEPTH_COMPONENT,a?v.type===Sn?vt=i.DEPTH_COMPONENT32F:v.type===Mn?vt=i.DEPTH_COMPONENT24:v.type===On?vt=i.DEPTH24_STENCIL8:vt=i.DEPTH_COMPONENT16:v.type===Sn&&console.error("WebGLRenderer: Floating point depth texture requires WebGL2."),v.format===Bn&&vt===i.DEPTH_COMPONENT&&v.type!==br&&v.type!==Mn&&(console.warn("THREE.WebGLRenderer: Use UnsignedShortType or UnsignedIntType for DepthFormat DepthTexture."),v.type=Mn,bt=r.convert(v.type)),v.format===pi&&vt===i.DEPTH_COMPONENT&&(vt=i.DEPTH_STENCIL,v.type!==On&&(console.warn("THREE.WebGLRenderer: Use UnsignedInt248Type for DepthStencilFormat DepthTexture."),v.type=On,bt=r.convert(v.type))),ne&&(Xt?e.texStorage2D(i.TEXTURE_2D,1,vt,Z.width,Z.height):e.texImage2D(i.TEXTURE_2D,0,vt,Z.width,Z.height,0,Ht,bt,null));else if(v.isDataTexture)if(Dt.length>0&&qt){Xt&&ne&&e.texStorage2D(i.TEXTURE_2D,Ot,vt,Dt[0].width,Dt[0].height);for(let st=0,R=Dt.length;st<R;st++)dt=Dt[st],Xt?e.texSubImage2D(i.TEXTURE_2D,st,0,0,dt.width,dt.height,Ht,bt,dt.data):e.texImage2D(i.TEXTURE_2D,st,vt,dt.width,dt.height,0,Ht,bt,dt.data);v.generateMipmaps=!1}else Xt?(ne&&e.texStorage2D(i.TEXTURE_2D,Ot,vt,Z.width,Z.height),e.texSubImage2D(i.TEXTURE_2D,0,0,0,Z.width,Z.height,Ht,bt,Z.data)):e.texImage2D(i.TEXTURE_2D,0,vt,Z.width,Z.height,0,Ht,bt,Z.data);else if(v.isCompressedTexture)if(v.isCompressedArrayTexture){Xt&&ne&&e.texStorage3D(i.TEXTURE_2D_ARRAY,Ot,vt,Dt[0].width,Dt[0].height,Z.depth);for(let st=0,R=Dt.length;st<R;st++)dt=Dt[st],v.format!==Ye?Ht!==null?Xt?e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,st,0,0,0,dt.width,dt.height,Z.depth,Ht,dt.data,0,0):e.compressedTexImage3D(i.TEXTURE_2D_ARRAY,st,vt,dt.width,dt.height,Z.depth,0,dt.data,0,0):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Xt?e.texSubImage3D(i.TEXTURE_2D_ARRAY,st,0,0,0,dt.width,dt.height,Z.depth,Ht,bt,dt.data):e.texImage3D(i.TEXTURE_2D_ARRAY,st,vt,dt.width,dt.height,Z.depth,0,Ht,bt,dt.data)}else{Xt&&ne&&e.texStorage2D(i.TEXTURE_2D,Ot,vt,Dt[0].width,Dt[0].height);for(let st=0,R=Dt.length;st<R;st++)dt=Dt[st],v.format!==Ye?Ht!==null?Xt?e.compressedTexSubImage2D(i.TEXTURE_2D,st,0,0,dt.width,dt.height,Ht,dt.data):e.compressedTexImage2D(i.TEXTURE_2D,st,vt,dt.width,dt.height,0,dt.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Xt?e.texSubImage2D(i.TEXTURE_2D,st,0,0,dt.width,dt.height,Ht,bt,dt.data):e.texImage2D(i.TEXTURE_2D,st,vt,dt.width,dt.height,0,Ht,bt,dt.data)}else if(v.isDataArrayTexture)Xt?(ne&&e.texStorage3D(i.TEXTURE_2D_ARRAY,Ot,vt,Z.width,Z.height,Z.depth),e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,Z.width,Z.height,Z.depth,Ht,bt,Z.data)):e.texImage3D(i.TEXTURE_2D_ARRAY,0,vt,Z.width,Z.height,Z.depth,0,Ht,bt,Z.data);else if(v.isData3DTexture)Xt?(ne&&e.texStorage3D(i.TEXTURE_3D,Ot,vt,Z.width,Z.height,Z.depth),e.texSubImage3D(i.TEXTURE_3D,0,0,0,0,Z.width,Z.height,Z.depth,Ht,bt,Z.data)):e.texImage3D(i.TEXTURE_3D,0,vt,Z.width,Z.height,Z.depth,0,Ht,bt,Z.data);else if(v.isFramebufferTexture){if(ne)if(Xt)e.texStorage2D(i.TEXTURE_2D,Ot,vt,Z.width,Z.height);else{let st=Z.width,R=Z.height;for(let at=0;at<Ot;at++)e.texImage2D(i.TEXTURE_2D,at,vt,st,R,0,Ht,bt,null),st>>=1,R>>=1}}else if(Dt.length>0&&qt){Xt&&ne&&e.texStorage2D(i.TEXTURE_2D,Ot,vt,Dt[0].width,Dt[0].height);for(let st=0,R=Dt.length;st<R;st++)dt=Dt[st],Xt?e.texSubImage2D(i.TEXTURE_2D,st,0,0,Ht,bt,dt):e.texImage2D(i.TEXTURE_2D,st,vt,Ht,bt,dt);v.generateMipmaps=!1}else Xt?(ne&&e.texStorage2D(i.TEXTURE_2D,Ot,vt,Z.width,Z.height),e.texSubImage2D(i.TEXTURE_2D,0,0,0,Ht,bt,Z)):e.texImage2D(i.TEXTURE_2D,0,vt,Ht,bt,Z);T(v,qt)&&y(Q),pt.__version=tt.version,v.onUpdate&&v.onUpdate(v)}S.__version=v.version}function _t(S,v,O){if(v.image.length!==6)return;const Q=K(S,v),J=v.source;e.bindTexture(i.TEXTURE_CUBE_MAP,S.__webglTexture,i.TEXTURE0+O);const tt=n.get(J);if(J.version!==tt.__version||Q===!0){e.activeTexture(i.TEXTURE0+O);const pt=Yt.getPrimaries(Yt.workingColorSpace),lt=v.colorSpace===Ge?null:Yt.getPrimaries(v.colorSpace),ut=v.colorSpace===Ge||pt===lt?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,v.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,v.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,v.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,ut);const yt=v.isCompressedTexture||v.image[0].isCompressedTexture,Nt=v.image[0]&&v.image[0].isDataTexture,Z=[];for(let st=0;st<6;st++)!yt&&!Nt?Z[st]=g(v.image[st],!1,!0,s.maxCubemapSize):Z[st]=Nt?v.image[st].image:v.image[st],Z[st]=Ut(v,Z[st]);const qt=Z[0],Ht=f(qt)||a,bt=r.convert(v.format,v.colorSpace),vt=r.convert(v.type),dt=A(v.internalFormat,bt,vt,v.colorSpace),Dt=a&&v.isVideoTexture!==!0,Xt=tt.__version===void 0||Q===!0;let ne=C(v,qt,Ht);G(i.TEXTURE_CUBE_MAP,v,Ht);let Ot;if(yt){Dt&&Xt&&e.texStorage2D(i.TEXTURE_CUBE_MAP,ne,dt,qt.width,qt.height);for(let st=0;st<6;st++){Ot=Z[st].mipmaps;for(let R=0;R<Ot.length;R++){const at=Ot[R];v.format!==Ye?bt!==null?Dt?e.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+st,R,0,0,at.width,at.height,bt,at.data):e.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+st,R,dt,at.width,at.height,0,at.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Dt?e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+st,R,0,0,at.width,at.height,bt,vt,at.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+st,R,dt,at.width,at.height,0,bt,vt,at.data)}}}else{Ot=v.mipmaps,Dt&&Xt&&(Ot.length>0&&ne++,e.texStorage2D(i.TEXTURE_CUBE_MAP,ne,dt,Z[0].width,Z[0].height));for(let st=0;st<6;st++)if(Nt){Dt?e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+st,0,0,0,Z[st].width,Z[st].height,bt,vt,Z[st].data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+st,0,dt,Z[st].width,Z[st].height,0,bt,vt,Z[st].data);for(let R=0;R<Ot.length;R++){const ot=Ot[R].image[st].image;Dt?e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+st,R+1,0,0,ot.width,ot.height,bt,vt,ot.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+st,R+1,dt,ot.width,ot.height,0,bt,vt,ot.data)}}else{Dt?e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+st,0,0,0,bt,vt,Z[st]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+st,0,dt,bt,vt,Z[st]);for(let R=0;R<Ot.length;R++){const at=Ot[R];Dt?e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+st,R+1,0,0,bt,vt,at.image[st]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+st,R+1,dt,bt,vt,at.image[st])}}}T(v,Ht)&&y(i.TEXTURE_CUBE_MAP),tt.__version=J.version,v.onUpdate&&v.onUpdate(v)}S.__version=v.version}function gt(S,v,O,Q,J,tt){const pt=r.convert(O.format,O.colorSpace),lt=r.convert(O.type),ut=A(O.internalFormat,pt,lt,O.colorSpace);if(!n.get(v).__hasExternalTextures){const Nt=Math.max(1,v.width>>tt),Z=Math.max(1,v.height>>tt);J===i.TEXTURE_3D||J===i.TEXTURE_2D_ARRAY?e.texImage3D(J,tt,ut,Nt,Z,v.depth,0,pt,lt,null):e.texImage2D(J,tt,ut,Nt,Z,0,pt,lt,null)}e.bindFramebuffer(i.FRAMEBUFFER,S),ft(v)?l.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,Q,J,n.get(O).__webglTexture,0,wt(v)):(J===i.TEXTURE_2D||J>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&J<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,Q,J,n.get(O).__webglTexture,tt),e.bindFramebuffer(i.FRAMEBUFFER,null)}function Ct(S,v,O){if(i.bindRenderbuffer(i.RENDERBUFFER,S),v.depthBuffer&&!v.stencilBuffer){let Q=a===!0?i.DEPTH_COMPONENT24:i.DEPTH_COMPONENT16;if(O||ft(v)){const J=v.depthTexture;J&&J.isDepthTexture&&(J.type===Sn?Q=i.DEPTH_COMPONENT32F:J.type===Mn&&(Q=i.DEPTH_COMPONENT24));const tt=wt(v);ft(v)?l.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,tt,Q,v.width,v.height):i.renderbufferStorageMultisample(i.RENDERBUFFER,tt,Q,v.width,v.height)}else i.renderbufferStorage(i.RENDERBUFFER,Q,v.width,v.height);i.framebufferRenderbuffer(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.RENDERBUFFER,S)}else if(v.depthBuffer&&v.stencilBuffer){const Q=wt(v);O&&ft(v)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,Q,i.DEPTH24_STENCIL8,v.width,v.height):ft(v)?l.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Q,i.DEPTH24_STENCIL8,v.width,v.height):i.renderbufferStorage(i.RENDERBUFFER,i.DEPTH_STENCIL,v.width,v.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.RENDERBUFFER,S)}else{const Q=v.isWebGLMultipleRenderTargets===!0?v.texture:[v.texture];for(let J=0;J<Q.length;J++){const tt=Q[J],pt=r.convert(tt.format,tt.colorSpace),lt=r.convert(tt.type),ut=A(tt.internalFormat,pt,lt,tt.colorSpace),yt=wt(v);O&&ft(v)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,yt,ut,v.width,v.height):ft(v)?l.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,yt,ut,v.width,v.height):i.renderbufferStorage(i.RENDERBUFFER,ut,v.width,v.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function Lt(S,v){if(v&&v.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(e.bindFramebuffer(i.FRAMEBUFFER,S),!(v.depthTexture&&v.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");(!n.get(v.depthTexture).__webglTexture||v.depthTexture.image.width!==v.width||v.depthTexture.image.height!==v.height)&&(v.depthTexture.image.width=v.width,v.depthTexture.image.height=v.height,v.depthTexture.needsUpdate=!0),k(v.depthTexture,0);const Q=n.get(v.depthTexture).__webglTexture,J=wt(v);if(v.depthTexture.format===Bn)ft(v)?l.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,Q,0,J):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,Q,0);else if(v.depthTexture.format===pi)ft(v)?l.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,Q,0,J):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,Q,0);else throw new Error("Unknown depthTexture format")}function Et(S){const v=n.get(S),O=S.isWebGLCubeRenderTarget===!0;if(S.depthTexture&&!v.__autoAllocateDepthBuffer){if(O)throw new Error("target.depthTexture not supported in Cube render targets");Lt(v.__webglFramebuffer,S)}else if(O){v.__webglDepthbuffer=[];for(let Q=0;Q<6;Q++)e.bindFramebuffer(i.FRAMEBUFFER,v.__webglFramebuffer[Q]),v.__webglDepthbuffer[Q]=i.createRenderbuffer(),Ct(v.__webglDepthbuffer[Q],S,!1)}else e.bindFramebuffer(i.FRAMEBUFFER,v.__webglFramebuffer),v.__webglDepthbuffer=i.createRenderbuffer(),Ct(v.__webglDepthbuffer,S,!1);e.bindFramebuffer(i.FRAMEBUFFER,null)}function Vt(S,v,O){const Q=n.get(S);v!==void 0&&gt(Q.__webglFramebuffer,S,S.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),O!==void 0&&Et(S)}function N(S){const v=S.texture,O=n.get(S),Q=n.get(v);S.addEventListener("dispose",$),S.isWebGLMultipleRenderTargets!==!0&&(Q.__webglTexture===void 0&&(Q.__webglTexture=i.createTexture()),Q.__version=v.version,o.memory.textures++);const J=S.isWebGLCubeRenderTarget===!0,tt=S.isWebGLMultipleRenderTargets===!0,pt=f(S)||a;if(J){O.__webglFramebuffer=[];for(let lt=0;lt<6;lt++)if(a&&v.mipmaps&&v.mipmaps.length>0){O.__webglFramebuffer[lt]=[];for(let ut=0;ut<v.mipmaps.length;ut++)O.__webglFramebuffer[lt][ut]=i.createFramebuffer()}else O.__webglFramebuffer[lt]=i.createFramebuffer()}else{if(a&&v.mipmaps&&v.mipmaps.length>0){O.__webglFramebuffer=[];for(let lt=0;lt<v.mipmaps.length;lt++)O.__webglFramebuffer[lt]=i.createFramebuffer()}else O.__webglFramebuffer=i.createFramebuffer();if(tt)if(s.drawBuffers){const lt=S.texture;for(let ut=0,yt=lt.length;ut<yt;ut++){const Nt=n.get(lt[ut]);Nt.__webglTexture===void 0&&(Nt.__webglTexture=i.createTexture(),o.memory.textures++)}}else console.warn("THREE.WebGLRenderer: WebGLMultipleRenderTargets can only be used with WebGL2 or WEBGL_draw_buffers extension.");if(a&&S.samples>0&&ft(S)===!1){const lt=tt?v:[v];O.__webglMultisampledFramebuffer=i.createFramebuffer(),O.__webglColorRenderbuffer=[],e.bindFramebuffer(i.FRAMEBUFFER,O.__webglMultisampledFramebuffer);for(let ut=0;ut<lt.length;ut++){const yt=lt[ut];O.__webglColorRenderbuffer[ut]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,O.__webglColorRenderbuffer[ut]);const Nt=r.convert(yt.format,yt.colorSpace),Z=r.convert(yt.type),qt=A(yt.internalFormat,Nt,Z,yt.colorSpace,S.isXRRenderTarget===!0),Ht=wt(S);i.renderbufferStorageMultisample(i.RENDERBUFFER,Ht,qt,S.width,S.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ut,i.RENDERBUFFER,O.__webglColorRenderbuffer[ut])}i.bindRenderbuffer(i.RENDERBUFFER,null),S.depthBuffer&&(O.__webglDepthRenderbuffer=i.createRenderbuffer(),Ct(O.__webglDepthRenderbuffer,S,!0)),e.bindFramebuffer(i.FRAMEBUFFER,null)}}if(J){e.bindTexture(i.TEXTURE_CUBE_MAP,Q.__webglTexture),G(i.TEXTURE_CUBE_MAP,v,pt);for(let lt=0;lt<6;lt++)if(a&&v.mipmaps&&v.mipmaps.length>0)for(let ut=0;ut<v.mipmaps.length;ut++)gt(O.__webglFramebuffer[lt][ut],S,v,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+lt,ut);else gt(O.__webglFramebuffer[lt],S,v,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+lt,0);T(v,pt)&&y(i.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(tt){const lt=S.texture;for(let ut=0,yt=lt.length;ut<yt;ut++){const Nt=lt[ut],Z=n.get(Nt);e.bindTexture(i.TEXTURE_2D,Z.__webglTexture),G(i.TEXTURE_2D,Nt,pt),gt(O.__webglFramebuffer,S,Nt,i.COLOR_ATTACHMENT0+ut,i.TEXTURE_2D,0),T(Nt,pt)&&y(i.TEXTURE_2D)}e.unbindTexture()}else{let lt=i.TEXTURE_2D;if((S.isWebGL3DRenderTarget||S.isWebGLArrayRenderTarget)&&(a?lt=S.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY:console.error("THREE.WebGLTextures: THREE.Data3DTexture and THREE.DataArrayTexture only supported with WebGL2.")),e.bindTexture(lt,Q.__webglTexture),G(lt,v,pt),a&&v.mipmaps&&v.mipmaps.length>0)for(let ut=0;ut<v.mipmaps.length;ut++)gt(O.__webglFramebuffer[ut],S,v,i.COLOR_ATTACHMENT0,lt,ut);else gt(O.__webglFramebuffer,S,v,i.COLOR_ATTACHMENT0,lt,0);T(v,pt)&&y(lt),e.unbindTexture()}S.depthBuffer&&Et(S)}function Me(S){const v=f(S)||a,O=S.isWebGLMultipleRenderTargets===!0?S.texture:[S.texture];for(let Q=0,J=O.length;Q<J;Q++){const tt=O[Q];if(T(tt,v)){const pt=S.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:i.TEXTURE_2D,lt=n.get(tt).__webglTexture;e.bindTexture(pt,lt),y(pt),e.unbindTexture()}}}function xt(S){if(a&&S.samples>0&&ft(S)===!1){const v=S.isWebGLMultipleRenderTargets?S.texture:[S.texture],O=S.width,Q=S.height;let J=i.COLOR_BUFFER_BIT;const tt=[],pt=S.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,lt=n.get(S),ut=S.isWebGLMultipleRenderTargets===!0;if(ut)for(let yt=0;yt<v.length;yt++)e.bindFramebuffer(i.FRAMEBUFFER,lt.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+yt,i.RENDERBUFFER,null),e.bindFramebuffer(i.FRAMEBUFFER,lt.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+yt,i.TEXTURE_2D,null,0);e.bindFramebuffer(i.READ_FRAMEBUFFER,lt.__webglMultisampledFramebuffer),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,lt.__webglFramebuffer);for(let yt=0;yt<v.length;yt++){tt.push(i.COLOR_ATTACHMENT0+yt),S.depthBuffer&&tt.push(pt);const Nt=lt.__ignoreDepthValues!==void 0?lt.__ignoreDepthValues:!1;if(Nt===!1&&(S.depthBuffer&&(J|=i.DEPTH_BUFFER_BIT),S.stencilBuffer&&(J|=i.STENCIL_BUFFER_BIT)),ut&&i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,lt.__webglColorRenderbuffer[yt]),Nt===!0&&(i.invalidateFramebuffer(i.READ_FRAMEBUFFER,[pt]),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[pt])),ut){const Z=n.get(v[yt]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,Z,0)}i.blitFramebuffer(0,0,O,Q,0,0,O,Q,J,i.NEAREST),c&&i.invalidateFramebuffer(i.READ_FRAMEBUFFER,tt)}if(e.bindFramebuffer(i.READ_FRAMEBUFFER,null),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),ut)for(let yt=0;yt<v.length;yt++){e.bindFramebuffer(i.FRAMEBUFFER,lt.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+yt,i.RENDERBUFFER,lt.__webglColorRenderbuffer[yt]);const Nt=n.get(v[yt]).__webglTexture;e.bindFramebuffer(i.FRAMEBUFFER,lt.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+yt,i.TEXTURE_2D,Nt,0)}e.bindFramebuffer(i.DRAW_FRAMEBUFFER,lt.__webglMultisampledFramebuffer)}}function wt(S){return Math.min(s.maxSamples,S.samples)}function ft(S){const v=n.get(S);return a&&S.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&v.__useRenderToTexture!==!1}function te(S){const v=o.render.frame;h.get(S)!==v&&(h.set(S,v),S.update())}function Ut(S,v){const O=S.colorSpace,Q=S.format,J=S.type;return S.isCompressedTexture===!0||S.isVideoTexture===!0||S.format===vr||O!==dn&&O!==Ge&&(Yt.getTransfer(O)===Jt?a===!1?t.has("EXT_sRGB")===!0&&Q===Ye?(S.format=vr,S.minFilter=ze,S.generateMipmaps=!1):v=Uo.sRGBToLinear(v):(Q!==Ye||J!==An)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",O)),v}this.allocateTextureUnit=P,this.resetTextureUnits=nt,this.setTexture2D=k,this.setTexture2DArray=Y,this.setTexture3D=X,this.setTextureCube=q,this.rebindTextures=Vt,this.setupRenderTarget=N,this.updateRenderTargetMipmap=Me,this.updateMultisampleRenderTarget=xt,this.setupDepthRenderbuffer=Et,this.setupFrameBufferTexture=gt,this.useMultisampledRTT=ft}function dp(i,t,e){const n=e.isWebGL2;function s(r,o=Ge){let a;const l=Yt.getTransfer(o);if(r===An)return i.UNSIGNED_BYTE;if(r===To)return i.UNSIGNED_SHORT_4_4_4_4;if(r===Ao)return i.UNSIGNED_SHORT_5_5_5_1;if(r===ql)return i.BYTE;if(r===Yl)return i.SHORT;if(r===br)return i.UNSIGNED_SHORT;if(r===Eo)return i.INT;if(r===Mn)return i.UNSIGNED_INT;if(r===Sn)return i.FLOAT;if(r===Ii)return n?i.HALF_FLOAT:(a=t.get("OES_texture_half_float"),a!==null?a.HALF_FLOAT_OES:null);if(r===$l)return i.ALPHA;if(r===Ye)return i.RGBA;if(r===jl)return i.LUMINANCE;if(r===Kl)return i.LUMINANCE_ALPHA;if(r===Bn)return i.DEPTH_COMPONENT;if(r===pi)return i.DEPTH_STENCIL;if(r===vr)return a=t.get("EXT_sRGB"),a!==null?a.SRGB_ALPHA_EXT:null;if(r===Zl)return i.RED;if(r===bo)return i.RED_INTEGER;if(r===Jl)return i.RG;if(r===wo)return i.RG_INTEGER;if(r===Ro)return i.RGBA_INTEGER;if(r===Is||r===Us||r===Ns||r===Fs)if(l===Jt)if(a=t.get("WEBGL_compressed_texture_s3tc_srgb"),a!==null){if(r===Is)return a.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(r===Us)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(r===Ns)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(r===Fs)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(a=t.get("WEBGL_compressed_texture_s3tc"),a!==null){if(r===Is)return a.COMPRESSED_RGB_S3TC_DXT1_EXT;if(r===Us)return a.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(r===Ns)return a.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(r===Fs)return a.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(r===qr||r===Yr||r===$r||r===jr)if(a=t.get("WEBGL_compressed_texture_pvrtc"),a!==null){if(r===qr)return a.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(r===Yr)return a.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(r===$r)return a.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(r===jr)return a.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(r===Co)return a=t.get("WEBGL_compressed_texture_etc1"),a!==null?a.COMPRESSED_RGB_ETC1_WEBGL:null;if(r===Kr||r===Zr)if(a=t.get("WEBGL_compressed_texture_etc"),a!==null){if(r===Kr)return l===Jt?a.COMPRESSED_SRGB8_ETC2:a.COMPRESSED_RGB8_ETC2;if(r===Zr)return l===Jt?a.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:a.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(r===Jr||r===Qr||r===ta||r===ea||r===na||r===ia||r===sa||r===ra||r===aa||r===oa||r===la||r===ca||r===ha||r===ua)if(a=t.get("WEBGL_compressed_texture_astc"),a!==null){if(r===Jr)return l===Jt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:a.COMPRESSED_RGBA_ASTC_4x4_KHR;if(r===Qr)return l===Jt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:a.COMPRESSED_RGBA_ASTC_5x4_KHR;if(r===ta)return l===Jt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:a.COMPRESSED_RGBA_ASTC_5x5_KHR;if(r===ea)return l===Jt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:a.COMPRESSED_RGBA_ASTC_6x5_KHR;if(r===na)return l===Jt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:a.COMPRESSED_RGBA_ASTC_6x6_KHR;if(r===ia)return l===Jt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:a.COMPRESSED_RGBA_ASTC_8x5_KHR;if(r===sa)return l===Jt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:a.COMPRESSED_RGBA_ASTC_8x6_KHR;if(r===ra)return l===Jt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:a.COMPRESSED_RGBA_ASTC_8x8_KHR;if(r===aa)return l===Jt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:a.COMPRESSED_RGBA_ASTC_10x5_KHR;if(r===oa)return l===Jt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:a.COMPRESSED_RGBA_ASTC_10x6_KHR;if(r===la)return l===Jt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:a.COMPRESSED_RGBA_ASTC_10x8_KHR;if(r===ca)return l===Jt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:a.COMPRESSED_RGBA_ASTC_10x10_KHR;if(r===ha)return l===Jt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:a.COMPRESSED_RGBA_ASTC_12x10_KHR;if(r===ua)return l===Jt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:a.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(r===Os||r===da||r===fa)if(a=t.get("EXT_texture_compression_bptc"),a!==null){if(r===Os)return l===Jt?a.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:a.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(r===da)return a.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(r===fa)return a.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(r===Ql||r===pa||r===ma||r===ga)if(a=t.get("EXT_texture_compression_rgtc"),a!==null){if(r===Os)return a.COMPRESSED_RED_RGTC1_EXT;if(r===pa)return a.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(r===ma)return a.COMPRESSED_RED_GREEN_RGTC2_EXT;if(r===ga)return a.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return r===On?n?i.UNSIGNED_INT_24_8:(a=t.get("WEBGL_depth_texture"),a!==null?a.UNSIGNED_INT_24_8_WEBGL:null):i[r]!==void 0?i[r]:null}return{convert:s}}class fp extends Ne{constructor(t=[]){super(),this.isArrayCamera=!0,this.cameras=t}}class cs extends we{constructor(){super(),this.isGroup=!0,this.type="Group"}}const pp={type:"move"};class lr{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new cs,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new cs,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new D,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new D),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new cs,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new D,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new D),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){const e=this._hand;if(e)for(const n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,n){let s=null,r=null,o=null;const a=this._targetRay,l=this._grip,c=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(c&&t.hand){o=!0;for(const g of t.hand.values()){const f=e.getJointPose(g,n),u=this._getHandJoint(c,g);f!==null&&(u.matrix.fromArray(f.transform.matrix),u.matrix.decompose(u.position,u.rotation,u.scale),u.matrixWorldNeedsUpdate=!0,u.jointRadius=f.radius),u.visible=f!==null}const h=c.joints["index-finger-tip"],d=c.joints["thumb-tip"],p=h.position.distanceTo(d.position),m=.02,_=.005;c.inputState.pinching&&p>m+_?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&p<=m-_&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(s=e.getPose(t.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(pp)))}return a!==null&&(a.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){const n=new cs;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}}class mp extends vi{constructor(t,e){super();const n=this;let s=null,r=1,o=null,a="local-floor",l=1,c=null,h=null,d=null,p=null,m=null,_=null;const g=e.getContextAttributes();let f=null,u=null;const T=[],y=[],A=new kt;let C=null;const b=new Ne;b.layers.enable(1),b.viewport=new Qt;const w=new Ne;w.layers.enable(2),w.viewport=new Qt;const $=[b,w],M=new fp;M.layers.enable(1),M.layers.enable(2);let E=null,V=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(G){let K=T[G];return K===void 0&&(K=new lr,T[G]=K),K.getTargetRaySpace()},this.getControllerGrip=function(G){let K=T[G];return K===void 0&&(K=new lr,T[G]=K),K.getGripSpace()},this.getHand=function(G){let K=T[G];return K===void 0&&(K=new lr,T[G]=K),K.getHandSpace()};function W(G){const K=y.indexOf(G.inputSource);if(K===-1)return;const ct=T[K];ct!==void 0&&(ct.update(G.inputSource,G.frame,c||o),ct.dispatchEvent({type:G.type,data:G.inputSource}))}function nt(){s.removeEventListener("select",W),s.removeEventListener("selectstart",W),s.removeEventListener("selectend",W),s.removeEventListener("squeeze",W),s.removeEventListener("squeezestart",W),s.removeEventListener("squeezeend",W),s.removeEventListener("end",nt),s.removeEventListener("inputsourceschange",P);for(let G=0;G<T.length;G++){const K=y[G];K!==null&&(y[G]=null,T[G].disconnect(K))}E=null,V=null,t.setRenderTarget(f),m=null,p=null,d=null,s=null,u=null,it.stop(),n.isPresenting=!1,t.setPixelRatio(C),t.setSize(A.width,A.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(G){r=G,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(G){a=G,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(G){c=G},this.getBaseLayer=function(){return p!==null?p:m},this.getBinding=function(){return d},this.getFrame=function(){return _},this.getSession=function(){return s},this.setSession=async function(G){if(s=G,s!==null){if(f=t.getRenderTarget(),s.addEventListener("select",W),s.addEventListener("selectstart",W),s.addEventListener("selectend",W),s.addEventListener("squeeze",W),s.addEventListener("squeezestart",W),s.addEventListener("squeezeend",W),s.addEventListener("end",nt),s.addEventListener("inputsourceschange",P),g.xrCompatible!==!0&&await e.makeXRCompatible(),C=t.getPixelRatio(),t.getSize(A),s.renderState.layers===void 0||t.capabilities.isWebGL2===!1){const K={antialias:s.renderState.layers===void 0?g.antialias:!0,alpha:!0,depth:g.depth,stencil:g.stencil,framebufferScaleFactor:r};m=new XRWebGLLayer(s,e,K),s.updateRenderState({baseLayer:m}),t.setPixelRatio(1),t.setSize(m.framebufferWidth,m.framebufferHeight,!1),u=new Hn(m.framebufferWidth,m.framebufferHeight,{format:Ye,type:An,colorSpace:t.outputColorSpace,stencilBuffer:g.stencil})}else{let K=null,ct=null,_t=null;g.depth&&(_t=g.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,K=g.stencil?pi:Bn,ct=g.stencil?On:Mn);const gt={colorFormat:e.RGBA8,depthFormat:_t,scaleFactor:r};d=new XRWebGLBinding(s,e),p=d.createProjectionLayer(gt),s.updateRenderState({layers:[p]}),t.setPixelRatio(1),t.setSize(p.textureWidth,p.textureHeight,!1),u=new Hn(p.textureWidth,p.textureHeight,{format:Ye,type:An,depthTexture:new Yo(p.textureWidth,p.textureHeight,ct,void 0,void 0,void 0,void 0,void 0,void 0,K),stencilBuffer:g.stencil,colorSpace:t.outputColorSpace,samples:g.antialias?4:0});const Ct=t.properties.get(u);Ct.__ignoreDepthValues=p.ignoreDepthValues}u.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await s.requestReferenceSpace(a),it.setContext(s),it.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode};function P(G){for(let K=0;K<G.removed.length;K++){const ct=G.removed[K],_t=y.indexOf(ct);_t>=0&&(y[_t]=null,T[_t].disconnect(ct))}for(let K=0;K<G.added.length;K++){const ct=G.added[K];let _t=y.indexOf(ct);if(_t===-1){for(let Ct=0;Ct<T.length;Ct++)if(Ct>=y.length){y.push(ct),_t=Ct;break}else if(y[Ct]===null){y[Ct]=ct,_t=Ct;break}if(_t===-1)break}const gt=T[_t];gt&&gt.connect(ct)}}const H=new D,k=new D;function Y(G,K,ct){H.setFromMatrixPosition(K.matrixWorld),k.setFromMatrixPosition(ct.matrixWorld);const _t=H.distanceTo(k),gt=K.projectionMatrix.elements,Ct=ct.projectionMatrix.elements,Lt=gt[14]/(gt[10]-1),Et=gt[14]/(gt[10]+1),Vt=(gt[9]+1)/gt[5],N=(gt[9]-1)/gt[5],Me=(gt[8]-1)/gt[0],xt=(Ct[8]+1)/Ct[0],wt=Lt*Me,ft=Lt*xt,te=_t/(-Me+xt),Ut=te*-Me;K.matrixWorld.decompose(G.position,G.quaternion,G.scale),G.translateX(Ut),G.translateZ(te),G.matrixWorld.compose(G.position,G.quaternion,G.scale),G.matrixWorldInverse.copy(G.matrixWorld).invert();const S=Lt+te,v=Et+te,O=wt-Ut,Q=ft+(_t-Ut),J=Vt*Et/v*S,tt=N*Et/v*S;G.projectionMatrix.makePerspective(O,Q,J,tt,S,v),G.projectionMatrixInverse.copy(G.projectionMatrix).invert()}function X(G,K){K===null?G.matrixWorld.copy(G.matrix):G.matrixWorld.multiplyMatrices(K.matrixWorld,G.matrix),G.matrixWorldInverse.copy(G.matrixWorld).invert()}this.updateCamera=function(G){if(s===null)return;M.near=w.near=b.near=G.near,M.far=w.far=b.far=G.far,(E!==M.near||V!==M.far)&&(s.updateRenderState({depthNear:M.near,depthFar:M.far}),E=M.near,V=M.far);const K=G.parent,ct=M.cameras;X(M,K);for(let _t=0;_t<ct.length;_t++)X(ct[_t],K);ct.length===2?Y(M,b,w):M.projectionMatrix.copy(b.projectionMatrix),q(G,M,K)};function q(G,K,ct){ct===null?G.matrix.copy(K.matrixWorld):(G.matrix.copy(ct.matrixWorld),G.matrix.invert(),G.matrix.multiply(K.matrixWorld)),G.matrix.decompose(G.position,G.quaternion,G.scale),G.updateMatrixWorld(!0),G.projectionMatrix.copy(K.projectionMatrix),G.projectionMatrixInverse.copy(K.projectionMatrixInverse),G.isPerspectiveCamera&&(G.fov=xr*2*Math.atan(1/G.projectionMatrix.elements[5]),G.zoom=1)}this.getCamera=function(){return M},this.getFoveation=function(){if(!(p===null&&m===null))return l},this.setFoveation=function(G){l=G,p!==null&&(p.fixedFoveation=G),m!==null&&m.fixedFoveation!==void 0&&(m.fixedFoveation=G)};let j=null;function et(G,K){if(h=K.getViewerPose(c||o),_=K,h!==null){const ct=h.views;m!==null&&(t.setRenderTargetFramebuffer(u,m.framebuffer),t.setRenderTarget(u));let _t=!1;ct.length!==M.cameras.length&&(M.cameras.length=0,_t=!0);for(let gt=0;gt<ct.length;gt++){const Ct=ct[gt];let Lt=null;if(m!==null)Lt=m.getViewport(Ct);else{const Vt=d.getViewSubImage(p,Ct);Lt=Vt.viewport,gt===0&&(t.setRenderTargetTextures(u,Vt.colorTexture,p.ignoreDepthValues?void 0:Vt.depthStencilTexture),t.setRenderTarget(u))}let Et=$[gt];Et===void 0&&(Et=new Ne,Et.layers.enable(gt),Et.viewport=new Qt,$[gt]=Et),Et.matrix.fromArray(Ct.transform.matrix),Et.matrix.decompose(Et.position,Et.quaternion,Et.scale),Et.projectionMatrix.fromArray(Ct.projectionMatrix),Et.projectionMatrixInverse.copy(Et.projectionMatrix).invert(),Et.viewport.set(Lt.x,Lt.y,Lt.width,Lt.height),gt===0&&(M.matrix.copy(Et.matrix),M.matrix.decompose(M.position,M.quaternion,M.scale)),_t===!0&&M.cameras.push(Et)}}for(let ct=0;ct<T.length;ct++){const _t=y[ct],gt=T[ct];_t!==null&&gt!==void 0&&gt.update(_t,K,c||o)}j&&j(G,K),K.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:K}),_=null}const it=new qo;it.setAnimationLoop(et),this.setAnimationLoop=function(G){j=G},this.dispose=function(){}}}function gp(i,t){function e(f,u){f.matrixAutoUpdate===!0&&f.updateMatrix(),u.value.copy(f.matrix)}function n(f,u){u.color.getRGB(f.fogColor.value,ko(i)),u.isFog?(f.fogNear.value=u.near,f.fogFar.value=u.far):u.isFogExp2&&(f.fogDensity.value=u.density)}function s(f,u,T,y,A){u.isMeshBasicMaterial||u.isMeshLambertMaterial?r(f,u):u.isMeshToonMaterial?(r(f,u),d(f,u)):u.isMeshPhongMaterial?(r(f,u),h(f,u)):u.isMeshStandardMaterial?(r(f,u),p(f,u),u.isMeshPhysicalMaterial&&m(f,u,A)):u.isMeshMatcapMaterial?(r(f,u),_(f,u)):u.isMeshDepthMaterial?r(f,u):u.isMeshDistanceMaterial?(r(f,u),g(f,u)):u.isMeshNormalMaterial?r(f,u):u.isLineBasicMaterial?(o(f,u),u.isLineDashedMaterial&&a(f,u)):u.isPointsMaterial?l(f,u,T,y):u.isSpriteMaterial?c(f,u):u.isShadowMaterial?(f.color.value.copy(u.color),f.opacity.value=u.opacity):u.isShaderMaterial&&(u.uniformsNeedUpdate=!1)}function r(f,u){f.opacity.value=u.opacity,u.color&&f.diffuse.value.copy(u.color),u.emissive&&f.emissive.value.copy(u.emissive).multiplyScalar(u.emissiveIntensity),u.map&&(f.map.value=u.map,e(u.map,f.mapTransform)),u.alphaMap&&(f.alphaMap.value=u.alphaMap,e(u.alphaMap,f.alphaMapTransform)),u.bumpMap&&(f.bumpMap.value=u.bumpMap,e(u.bumpMap,f.bumpMapTransform),f.bumpScale.value=u.bumpScale,u.side===be&&(f.bumpScale.value*=-1)),u.normalMap&&(f.normalMap.value=u.normalMap,e(u.normalMap,f.normalMapTransform),f.normalScale.value.copy(u.normalScale),u.side===be&&f.normalScale.value.negate()),u.displacementMap&&(f.displacementMap.value=u.displacementMap,e(u.displacementMap,f.displacementMapTransform),f.displacementScale.value=u.displacementScale,f.displacementBias.value=u.displacementBias),u.emissiveMap&&(f.emissiveMap.value=u.emissiveMap,e(u.emissiveMap,f.emissiveMapTransform)),u.specularMap&&(f.specularMap.value=u.specularMap,e(u.specularMap,f.specularMapTransform)),u.alphaTest>0&&(f.alphaTest.value=u.alphaTest);const T=t.get(u).envMap;if(T&&(f.envMap.value=T,f.flipEnvMap.value=T.isCubeTexture&&T.isRenderTargetTexture===!1?-1:1,f.reflectivity.value=u.reflectivity,f.ior.value=u.ior,f.refractionRatio.value=u.refractionRatio),u.lightMap){f.lightMap.value=u.lightMap;const y=i._useLegacyLights===!0?Math.PI:1;f.lightMapIntensity.value=u.lightMapIntensity*y,e(u.lightMap,f.lightMapTransform)}u.aoMap&&(f.aoMap.value=u.aoMap,f.aoMapIntensity.value=u.aoMapIntensity,e(u.aoMap,f.aoMapTransform))}function o(f,u){f.diffuse.value.copy(u.color),f.opacity.value=u.opacity,u.map&&(f.map.value=u.map,e(u.map,f.mapTransform))}function a(f,u){f.dashSize.value=u.dashSize,f.totalSize.value=u.dashSize+u.gapSize,f.scale.value=u.scale}function l(f,u,T,y){f.diffuse.value.copy(u.color),f.opacity.value=u.opacity,f.size.value=u.size*T,f.scale.value=y*.5,u.map&&(f.map.value=u.map,e(u.map,f.uvTransform)),u.alphaMap&&(f.alphaMap.value=u.alphaMap,e(u.alphaMap,f.alphaMapTransform)),u.alphaTest>0&&(f.alphaTest.value=u.alphaTest)}function c(f,u){f.diffuse.value.copy(u.color),f.opacity.value=u.opacity,f.rotation.value=u.rotation,u.map&&(f.map.value=u.map,e(u.map,f.mapTransform)),u.alphaMap&&(f.alphaMap.value=u.alphaMap,e(u.alphaMap,f.alphaMapTransform)),u.alphaTest>0&&(f.alphaTest.value=u.alphaTest)}function h(f,u){f.specular.value.copy(u.specular),f.shininess.value=Math.max(u.shininess,1e-4)}function d(f,u){u.gradientMap&&(f.gradientMap.value=u.gradientMap)}function p(f,u){f.metalness.value=u.metalness,u.metalnessMap&&(f.metalnessMap.value=u.metalnessMap,e(u.metalnessMap,f.metalnessMapTransform)),f.roughness.value=u.roughness,u.roughnessMap&&(f.roughnessMap.value=u.roughnessMap,e(u.roughnessMap,f.roughnessMapTransform)),t.get(u).envMap&&(f.envMapIntensity.value=u.envMapIntensity)}function m(f,u,T){f.ior.value=u.ior,u.sheen>0&&(f.sheenColor.value.copy(u.sheenColor).multiplyScalar(u.sheen),f.sheenRoughness.value=u.sheenRoughness,u.sheenColorMap&&(f.sheenColorMap.value=u.sheenColorMap,e(u.sheenColorMap,f.sheenColorMapTransform)),u.sheenRoughnessMap&&(f.sheenRoughnessMap.value=u.sheenRoughnessMap,e(u.sheenRoughnessMap,f.sheenRoughnessMapTransform))),u.clearcoat>0&&(f.clearcoat.value=u.clearcoat,f.clearcoatRoughness.value=u.clearcoatRoughness,u.clearcoatMap&&(f.clearcoatMap.value=u.clearcoatMap,e(u.clearcoatMap,f.clearcoatMapTransform)),u.clearcoatRoughnessMap&&(f.clearcoatRoughnessMap.value=u.clearcoatRoughnessMap,e(u.clearcoatRoughnessMap,f.clearcoatRoughnessMapTransform)),u.clearcoatNormalMap&&(f.clearcoatNormalMap.value=u.clearcoatNormalMap,e(u.clearcoatNormalMap,f.clearcoatNormalMapTransform),f.clearcoatNormalScale.value.copy(u.clearcoatNormalScale),u.side===be&&f.clearcoatNormalScale.value.negate())),u.iridescence>0&&(f.iridescence.value=u.iridescence,f.iridescenceIOR.value=u.iridescenceIOR,f.iridescenceThicknessMinimum.value=u.iridescenceThicknessRange[0],f.iridescenceThicknessMaximum.value=u.iridescenceThicknessRange[1],u.iridescenceMap&&(f.iridescenceMap.value=u.iridescenceMap,e(u.iridescenceMap,f.iridescenceMapTransform)),u.iridescenceThicknessMap&&(f.iridescenceThicknessMap.value=u.iridescenceThicknessMap,e(u.iridescenceThicknessMap,f.iridescenceThicknessMapTransform))),u.transmission>0&&(f.transmission.value=u.transmission,f.transmissionSamplerMap.value=T.texture,f.transmissionSamplerSize.value.set(T.width,T.height),u.transmissionMap&&(f.transmissionMap.value=u.transmissionMap,e(u.transmissionMap,f.transmissionMapTransform)),f.thickness.value=u.thickness,u.thicknessMap&&(f.thicknessMap.value=u.thicknessMap,e(u.thicknessMap,f.thicknessMapTransform)),f.attenuationDistance.value=u.attenuationDistance,f.attenuationColor.value.copy(u.attenuationColor)),u.anisotropy>0&&(f.anisotropyVector.value.set(u.anisotropy*Math.cos(u.anisotropyRotation),u.anisotropy*Math.sin(u.anisotropyRotation)),u.anisotropyMap&&(f.anisotropyMap.value=u.anisotropyMap,e(u.anisotropyMap,f.anisotropyMapTransform))),f.specularIntensity.value=u.specularIntensity,f.specularColor.value.copy(u.specularColor),u.specularColorMap&&(f.specularColorMap.value=u.specularColorMap,e(u.specularColorMap,f.specularColorMapTransform)),u.specularIntensityMap&&(f.specularIntensityMap.value=u.specularIntensityMap,e(u.specularIntensityMap,f.specularIntensityMapTransform))}function _(f,u){u.matcap&&(f.matcap.value=u.matcap)}function g(f,u){const T=t.get(u).light;f.referencePosition.value.setFromMatrixPosition(T.matrixWorld),f.nearDistance.value=T.shadow.camera.near,f.farDistance.value=T.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function _p(i,t,e,n){let s={},r={},o=[];const a=e.isWebGL2?i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS):0;function l(T,y){const A=y.program;n.uniformBlockBinding(T,A)}function c(T,y){let A=s[T.id];A===void 0&&(_(T),A=h(T),s[T.id]=A,T.addEventListener("dispose",f));const C=y.program;n.updateUBOMapping(T,C);const b=t.render.frame;r[T.id]!==b&&(p(T),r[T.id]=b)}function h(T){const y=d();T.__bindingPointIndex=y;const A=i.createBuffer(),C=T.__size,b=T.usage;return i.bindBuffer(i.UNIFORM_BUFFER,A),i.bufferData(i.UNIFORM_BUFFER,C,b),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,y,A),A}function d(){for(let T=0;T<a;T++)if(o.indexOf(T)===-1)return o.push(T),T;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function p(T){const y=s[T.id],A=T.uniforms,C=T.__cache;i.bindBuffer(i.UNIFORM_BUFFER,y);for(let b=0,w=A.length;b<w;b++){const $=Array.isArray(A[b])?A[b]:[A[b]];for(let M=0,E=$.length;M<E;M++){const V=$[M];if(m(V,b,M,C)===!0){const W=V.__offset,nt=Array.isArray(V.value)?V.value:[V.value];let P=0;for(let H=0;H<nt.length;H++){const k=nt[H],Y=g(k);typeof k=="number"||typeof k=="boolean"?(V.__data[0]=k,i.bufferSubData(i.UNIFORM_BUFFER,W+P,V.__data)):k.isMatrix3?(V.__data[0]=k.elements[0],V.__data[1]=k.elements[1],V.__data[2]=k.elements[2],V.__data[3]=0,V.__data[4]=k.elements[3],V.__data[5]=k.elements[4],V.__data[6]=k.elements[5],V.__data[7]=0,V.__data[8]=k.elements[6],V.__data[9]=k.elements[7],V.__data[10]=k.elements[8],V.__data[11]=0):(k.toArray(V.__data,P),P+=Y.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,W,V.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function m(T,y,A,C){const b=T.value,w=y+"_"+A;if(C[w]===void 0)return typeof b=="number"||typeof b=="boolean"?C[w]=b:C[w]=b.clone(),!0;{const $=C[w];if(typeof b=="number"||typeof b=="boolean"){if($!==b)return C[w]=b,!0}else if($.equals(b)===!1)return $.copy(b),!0}return!1}function _(T){const y=T.uniforms;let A=0;const C=16;for(let w=0,$=y.length;w<$;w++){const M=Array.isArray(y[w])?y[w]:[y[w]];for(let E=0,V=M.length;E<V;E++){const W=M[E],nt=Array.isArray(W.value)?W.value:[W.value];for(let P=0,H=nt.length;P<H;P++){const k=nt[P],Y=g(k),X=A%C;X!==0&&C-X<Y.boundary&&(A+=C-X),W.__data=new Float32Array(Y.storage/Float32Array.BYTES_PER_ELEMENT),W.__offset=A,A+=Y.storage}}}const b=A%C;return b>0&&(A+=C-b),T.__size=A,T.__cache={},this}function g(T){const y={boundary:0,storage:0};return typeof T=="number"||typeof T=="boolean"?(y.boundary=4,y.storage=4):T.isVector2?(y.boundary=8,y.storage=8):T.isVector3||T.isColor?(y.boundary=16,y.storage=12):T.isVector4?(y.boundary=16,y.storage=16):T.isMatrix3?(y.boundary=48,y.storage=48):T.isMatrix4?(y.boundary=64,y.storage=64):T.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",T),y}function f(T){const y=T.target;y.removeEventListener("dispose",f);const A=o.indexOf(y.__bindingPointIndex);o.splice(A,1),i.deleteBuffer(s[y.id]),delete s[y.id],delete r[y.id]}function u(){for(const T in s)i.deleteBuffer(s[T]);o=[],s={},r={}}return{bind:l,update:c,dispose:u}}class Qo{constructor(t={}){const{canvas:e=uc(),context:n=null,depth:s=!0,stencil:r=!0,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:d=!1}=t;this.isWebGLRenderer=!0;let p;n!==null?p=n.getContextAttributes().alpha:p=o;const m=new Uint32Array(4),_=new Int32Array(4);let g=null,f=null;const u=[],T=[];this.domElement=e,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=fe,this._useLegacyLights=!1,this.toneMapping=Tn,this.toneMappingExposure=1;const y=this;let A=!1,C=0,b=0,w=null,$=-1,M=null;const E=new Qt,V=new Qt;let W=null;const nt=new Gt(0);let P=0,H=e.width,k=e.height,Y=1,X=null,q=null;const j=new Qt(0,0,H,k),et=new Qt(0,0,H,k);let it=!1;const G=new Rr;let K=!1,ct=!1,_t=null;const gt=new re,Ct=new kt,Lt=new D,Et={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};function Vt(){return w===null?Y:1}let N=n;function Me(x,I){for(let B=0;B<x.length;B++){const z=x[B],F=e.getContext(z,I);if(F!==null)return F}return null}try{const x={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:d};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${Ar}`),e.addEventListener("webglcontextlost",st,!1),e.addEventListener("webglcontextrestored",R,!1),e.addEventListener("webglcontextcreationerror",at,!1),N===null){const I=["webgl2","webgl","experimental-webgl"];if(y.isWebGL1Renderer===!0&&I.shift(),N=Me(I,x),N===null)throw Me(I)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}typeof WebGLRenderingContext<"u"&&N instanceof WebGLRenderingContext&&console.warn("THREE.WebGLRenderer: WebGL 1 support was deprecated in r153 and will be removed in r163."),N.getShaderPrecisionFormat===void 0&&(N.getShaderPrecisionFormat=function(){return{rangeMin:1,rangeMax:1,precision:1}})}catch(x){throw console.error("THREE.WebGLRenderer: "+x.message),x}let xt,wt,ft,te,Ut,S,v,O,Q,J,tt,pt,lt,ut,yt,Nt,Z,qt,Ht,bt,vt,dt,Dt,Xt;function ne(){xt=new bd(N),wt=new xd(N,xt,t),xt.init(wt),dt=new dp(N,xt,wt),ft=new hp(N,xt,wt),te=new Cd(N),Ut=new Kf,S=new up(N,xt,ft,Ut,wt,dt,te),v=new Sd(y),O=new Ad(y),Q=new Fc(N,wt),Dt=new _d(N,xt,Q,wt),J=new wd(N,Q,te,Dt),tt=new Id(N,J,Q,te),Ht=new Dd(N,wt,S),Nt=new Md(Ut),pt=new jf(y,v,O,xt,wt,Dt,Nt),lt=new gp(y,Ut),ut=new Jf,yt=new sp(xt,wt),qt=new gd(y,v,O,ft,tt,p,l),Z=new cp(y,tt,wt),Xt=new _p(N,te,wt,ft),bt=new vd(N,xt,te,wt),vt=new Rd(N,xt,te,wt),te.programs=pt.programs,y.capabilities=wt,y.extensions=xt,y.properties=Ut,y.renderLists=ut,y.shadowMap=Z,y.state=ft,y.info=te}ne();const Ot=new mp(y,N);this.xr=Ot,this.getContext=function(){return N},this.getContextAttributes=function(){return N.getContextAttributes()},this.forceContextLoss=function(){const x=xt.get("WEBGL_lose_context");x&&x.loseContext()},this.forceContextRestore=function(){const x=xt.get("WEBGL_lose_context");x&&x.restoreContext()},this.getPixelRatio=function(){return Y},this.setPixelRatio=function(x){x!==void 0&&(Y=x,this.setSize(H,k,!1))},this.getSize=function(x){return x.set(H,k)},this.setSize=function(x,I,B=!0){if(Ot.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}H=x,k=I,e.width=Math.floor(x*Y),e.height=Math.floor(I*Y),B===!0&&(e.style.width=x+"px",e.style.height=I+"px"),this.setViewport(0,0,x,I)},this.getDrawingBufferSize=function(x){return x.set(H*Y,k*Y).floor()},this.setDrawingBufferSize=function(x,I,B){H=x,k=I,Y=B,e.width=Math.floor(x*B),e.height=Math.floor(I*B),this.setViewport(0,0,x,I)},this.getCurrentViewport=function(x){return x.copy(E)},this.getViewport=function(x){return x.copy(j)},this.setViewport=function(x,I,B,z){x.isVector4?j.set(x.x,x.y,x.z,x.w):j.set(x,I,B,z),ft.viewport(E.copy(j).multiplyScalar(Y).floor())},this.getScissor=function(x){return x.copy(et)},this.setScissor=function(x,I,B,z){x.isVector4?et.set(x.x,x.y,x.z,x.w):et.set(x,I,B,z),ft.scissor(V.copy(et).multiplyScalar(Y).floor())},this.getScissorTest=function(){return it},this.setScissorTest=function(x){ft.setScissorTest(it=x)},this.setOpaqueSort=function(x){X=x},this.setTransparentSort=function(x){q=x},this.getClearColor=function(x){return x.copy(qt.getClearColor())},this.setClearColor=function(){qt.setClearColor.apply(qt,arguments)},this.getClearAlpha=function(){return qt.getClearAlpha()},this.setClearAlpha=function(){qt.setClearAlpha.apply(qt,arguments)},this.clear=function(x=!0,I=!0,B=!0){let z=0;if(x){let F=!1;if(w!==null){const ht=w.texture.format;F=ht===Ro||ht===wo||ht===bo}if(F){const ht=w.texture.type,mt=ht===An||ht===Mn||ht===br||ht===On||ht===To||ht===Ao,St=qt.getClearColor(),At=qt.getClearAlpha(),Ft=St.r,Rt=St.g,Pt=St.b;mt?(m[0]=Ft,m[1]=Rt,m[2]=Pt,m[3]=At,N.clearBufferuiv(N.COLOR,0,m)):(_[0]=Ft,_[1]=Rt,_[2]=Pt,_[3]=At,N.clearBufferiv(N.COLOR,0,_))}else z|=N.COLOR_BUFFER_BIT}I&&(z|=N.DEPTH_BUFFER_BIT),B&&(z|=N.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),N.clear(z)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){e.removeEventListener("webglcontextlost",st,!1),e.removeEventListener("webglcontextrestored",R,!1),e.removeEventListener("webglcontextcreationerror",at,!1),ut.dispose(),yt.dispose(),Ut.dispose(),v.dispose(),O.dispose(),tt.dispose(),Dt.dispose(),Xt.dispose(),pt.dispose(),Ot.dispose(),Ot.removeEventListener("sessionstart",Se),Ot.removeEventListener("sessionend",Zt),_t&&(_t.dispose(),_t=null),ye.stop()};function st(x){x.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),A=!0}function R(){console.log("THREE.WebGLRenderer: Context Restored."),A=!1;const x=te.autoReset,I=Z.enabled,B=Z.autoUpdate,z=Z.needsUpdate,F=Z.type;ne(),te.autoReset=x,Z.enabled=I,Z.autoUpdate=B,Z.needsUpdate=z,Z.type=F}function at(x){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",x.statusMessage)}function ot(x){const I=x.target;I.removeEventListener("dispose",ot),Tt(I)}function Tt(x){Mt(x),Ut.remove(x)}function Mt(x){const I=Ut.get(x).programs;I!==void 0&&(I.forEach(function(B){pt.releaseProgram(B)}),x.isShaderMaterial&&pt.releaseShaderCache(x))}this.renderBufferDirect=function(x,I,B,z,F,ht){I===null&&(I=Et);const mt=F.isMesh&&F.matrixWorld.determinant()<0,St=al(x,I,B,z,F);ft.setMaterial(z,mt);let At=B.index,Ft=1;if(z.wireframe===!0){if(At=J.getWireframeAttribute(B),At===void 0)return;Ft=2}const Rt=B.drawRange,Pt=B.attributes.position;let se=Rt.start*Ft,De=(Rt.start+Rt.count)*Ft;ht!==null&&(se=Math.max(se,ht.start*Ft),De=Math.min(De,(ht.start+ht.count)*Ft)),At!==null?(se=Math.max(se,0),De=Math.min(De,At.count)):Pt!=null&&(se=Math.max(se,0),De=Math.min(De,Pt.count));const he=De-se;if(he<0||he===1/0)return;Dt.setup(F,z,St,B,At);let en,ee=bt;if(At!==null&&(en=Q.get(At),ee=vt,ee.setIndex(en)),F.isMesh)z.wireframe===!0?(ft.setLineWidth(z.wireframeLinewidth*Vt()),ee.setMode(N.LINES)):ee.setMode(N.TRIANGLES);else if(F.isLine){let Bt=z.linewidth;Bt===void 0&&(Bt=1),ft.setLineWidth(Bt*Vt()),F.isLineSegments?ee.setMode(N.LINES):F.isLineLoop?ee.setMode(N.LINE_LOOP):ee.setMode(N.LINE_STRIP)}else F.isPoints?ee.setMode(N.POINTS):F.isSprite&&ee.setMode(N.TRIANGLES);if(F.isBatchedMesh)ee.renderMultiDraw(F._multiDrawStarts,F._multiDrawCounts,F._multiDrawCount);else if(F.isInstancedMesh)ee.renderInstances(se,he,F.count);else if(B.isInstancedBufferGeometry){const Bt=B._maxInstanceCount!==void 0?B._maxInstanceCount:1/0,Rs=Math.min(B.instanceCount,Bt);ee.renderInstances(se,he,Rs)}else ee.render(se,he)};function jt(x,I,B){x.transparent===!0&&x.side===tn&&x.forceSinglePass===!1?(x.side=be,x.needsUpdate=!0,Hi(x,I,B),x.side=bn,x.needsUpdate=!0,Hi(x,I,B),x.side=tn):Hi(x,I,B)}this.compile=function(x,I,B=null){B===null&&(B=x),f=yt.get(B),f.init(),T.push(f),B.traverseVisible(function(F){F.isLight&&F.layers.test(I.layers)&&(f.pushLight(F),F.castShadow&&f.pushShadow(F))}),x!==B&&x.traverseVisible(function(F){F.isLight&&F.layers.test(I.layers)&&(f.pushLight(F),F.castShadow&&f.pushShadow(F))}),f.setupLights(y._useLegacyLights);const z=new Set;return x.traverse(function(F){const ht=F.material;if(ht)if(Array.isArray(ht))for(let mt=0;mt<ht.length;mt++){const St=ht[mt];jt(St,B,F),z.add(St)}else jt(ht,B,F),z.add(ht)}),T.pop(),f=null,z},this.compileAsync=function(x,I,B=null){const z=this.compile(x,I,B);return new Promise(F=>{function ht(){if(z.forEach(function(mt){Ut.get(mt).currentProgram.isReady()&&z.delete(mt)}),z.size===0){F(x);return}setTimeout(ht,10)}xt.get("KHR_parallel_shader_compile")!==null?ht():setTimeout(ht,10)})};let Kt=null;function ce(x){Kt&&Kt(x)}function Se(){ye.stop()}function Zt(){ye.start()}const ye=new qo;ye.setAnimationLoop(ce),typeof self<"u"&&ye.setContext(self),this.setAnimationLoop=function(x){Kt=x,Ot.setAnimationLoop(x),x===null?ye.stop():ye.start()},Ot.addEventListener("sessionstart",Se),Ot.addEventListener("sessionend",Zt),this.render=function(x,I){if(I!==void 0&&I.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(A===!0)return;x.matrixWorldAutoUpdate===!0&&x.updateMatrixWorld(),I.parent===null&&I.matrixWorldAutoUpdate===!0&&I.updateMatrixWorld(),Ot.enabled===!0&&Ot.isPresenting===!0&&(Ot.cameraAutoUpdate===!0&&Ot.updateCamera(I),I=Ot.getCamera()),x.isScene===!0&&x.onBeforeRender(y,x,I,w),f=yt.get(x,T.length),f.init(),T.push(f),gt.multiplyMatrices(I.projectionMatrix,I.matrixWorldInverse),G.setFromProjectionMatrix(gt),ct=this.localClippingEnabled,K=Nt.init(this.clippingPlanes,ct),g=ut.get(x,u.length),g.init(),u.push(g),Ze(x,I,0,y.sortObjects),g.finish(),y.sortObjects===!0&&g.sort(X,q),this.info.render.frame++,K===!0&&Nt.beginShadows();const B=f.state.shadowsArray;if(Z.render(B,x,I),K===!0&&Nt.endShadows(),this.info.autoReset===!0&&this.info.reset(),qt.render(g,x),f.setupLights(y._useLegacyLights),I.isArrayCamera){const z=I.cameras;for(let F=0,ht=z.length;F<ht;F++){const mt=z[F];Ur(g,x,mt,mt.viewport)}}else Ur(g,x,I);w!==null&&(S.updateMultisampleRenderTarget(w),S.updateRenderTargetMipmap(w)),x.isScene===!0&&x.onAfterRender(y,x,I),Dt.resetDefaultState(),$=-1,M=null,T.pop(),T.length>0?f=T[T.length-1]:f=null,u.pop(),u.length>0?g=u[u.length-1]:g=null};function Ze(x,I,B,z){if(x.visible===!1)return;if(x.layers.test(I.layers)){if(x.isGroup)B=x.renderOrder;else if(x.isLOD)x.autoUpdate===!0&&x.update(I);else if(x.isLight)f.pushLight(x),x.castShadow&&f.pushShadow(x);else if(x.isSprite){if(!x.frustumCulled||G.intersectsSprite(x)){z&&Lt.setFromMatrixPosition(x.matrixWorld).applyMatrix4(gt);const mt=tt.update(x),St=x.material;St.visible&&g.push(x,mt,St,B,Lt.z,null)}}else if((x.isMesh||x.isLine||x.isPoints)&&(!x.frustumCulled||G.intersectsObject(x))){const mt=tt.update(x),St=x.material;if(z&&(x.boundingSphere!==void 0?(x.boundingSphere===null&&x.computeBoundingSphere(),Lt.copy(x.boundingSphere.center)):(mt.boundingSphere===null&&mt.computeBoundingSphere(),Lt.copy(mt.boundingSphere.center)),Lt.applyMatrix4(x.matrixWorld).applyMatrix4(gt)),Array.isArray(St)){const At=mt.groups;for(let Ft=0,Rt=At.length;Ft<Rt;Ft++){const Pt=At[Ft],se=St[Pt.materialIndex];se&&se.visible&&g.push(x,mt,se,B,Lt.z,Pt)}}else St.visible&&g.push(x,mt,St,B,Lt.z,null)}}const ht=x.children;for(let mt=0,St=ht.length;mt<St;mt++)Ze(ht[mt],I,B,z)}function Ur(x,I,B,z){const F=x.opaque,ht=x.transmissive,mt=x.transparent;f.setupLightsView(B),K===!0&&Nt.setGlobalState(y.clippingPlanes,B),ht.length>0&&rl(F,ht,I,B),z&&ft.viewport(E.copy(z)),F.length>0&&zi(F,I,B),ht.length>0&&zi(ht,I,B),mt.length>0&&zi(mt,I,B),ft.buffers.depth.setTest(!0),ft.buffers.depth.setMask(!0),ft.buffers.color.setMask(!0),ft.setPolygonOffset(!1)}function rl(x,I,B,z){if((B.isScene===!0?B.overrideMaterial:null)!==null)return;const ht=wt.isWebGL2;_t===null&&(_t=new Hn(1,1,{generateMipmaps:!0,type:xt.has("EXT_color_buffer_half_float")?Ii:An,minFilter:Di,samples:ht?4:0})),y.getDrawingBufferSize(Ct),ht?_t.setSize(Ct.x,Ct.y):_t.setSize(Mr(Ct.x),Mr(Ct.y));const mt=y.getRenderTarget();y.setRenderTarget(_t),y.getClearColor(nt),P=y.getClearAlpha(),P<1&&y.setClearColor(16777215,.5),y.clear();const St=y.toneMapping;y.toneMapping=Tn,zi(x,B,z),S.updateMultisampleRenderTarget(_t),S.updateRenderTargetMipmap(_t);let At=!1;for(let Ft=0,Rt=I.length;Ft<Rt;Ft++){const Pt=I[Ft],se=Pt.object,De=Pt.geometry,he=Pt.material,en=Pt.group;if(he.side===tn&&se.layers.test(z.layers)){const ee=he.side;he.side=be,he.needsUpdate=!0,Nr(se,B,z,De,he,en),he.side=ee,he.needsUpdate=!0,At=!0}}At===!0&&(S.updateMultisampleRenderTarget(_t),S.updateRenderTargetMipmap(_t)),y.setRenderTarget(mt),y.setClearColor(nt,P),y.toneMapping=St}function zi(x,I,B){const z=I.isScene===!0?I.overrideMaterial:null;for(let F=0,ht=x.length;F<ht;F++){const mt=x[F],St=mt.object,At=mt.geometry,Ft=z===null?mt.material:z,Rt=mt.group;St.layers.test(B.layers)&&Nr(St,I,B,At,Ft,Rt)}}function Nr(x,I,B,z,F,ht){x.onBeforeRender(y,I,B,z,F,ht),x.modelViewMatrix.multiplyMatrices(B.matrixWorldInverse,x.matrixWorld),x.normalMatrix.getNormalMatrix(x.modelViewMatrix),F.onBeforeRender(y,I,B,z,x,ht),F.transparent===!0&&F.side===tn&&F.forceSinglePass===!1?(F.side=be,F.needsUpdate=!0,y.renderBufferDirect(B,I,z,F,x,ht),F.side=bn,F.needsUpdate=!0,y.renderBufferDirect(B,I,z,F,x,ht),F.side=tn):y.renderBufferDirect(B,I,z,F,x,ht),x.onAfterRender(y,I,B,z,F,ht)}function Hi(x,I,B){I.isScene!==!0&&(I=Et);const z=Ut.get(x),F=f.state.lights,ht=f.state.shadowsArray,mt=F.state.version,St=pt.getParameters(x,F.state,ht,I,B),At=pt.getProgramCacheKey(St);let Ft=z.programs;z.environment=x.isMeshStandardMaterial?I.environment:null,z.fog=I.fog,z.envMap=(x.isMeshStandardMaterial?O:v).get(x.envMap||z.environment),Ft===void 0&&(x.addEventListener("dispose",ot),Ft=new Map,z.programs=Ft);let Rt=Ft.get(At);if(Rt!==void 0){if(z.currentProgram===Rt&&z.lightsStateVersion===mt)return Or(x,St),Rt}else St.uniforms=pt.getUniforms(x),x.onBuild(B,St,y),x.onBeforeCompile(St,y),Rt=pt.acquireProgram(St,At),Ft.set(At,Rt),z.uniforms=St.uniforms;const Pt=z.uniforms;return(!x.isShaderMaterial&&!x.isRawShaderMaterial||x.clipping===!0)&&(Pt.clippingPlanes=Nt.uniform),Or(x,St),z.needsLights=ll(x),z.lightsStateVersion=mt,z.needsLights&&(Pt.ambientLightColor.value=F.state.ambient,Pt.lightProbe.value=F.state.probe,Pt.directionalLights.value=F.state.directional,Pt.directionalLightShadows.value=F.state.directionalShadow,Pt.spotLights.value=F.state.spot,Pt.spotLightShadows.value=F.state.spotShadow,Pt.rectAreaLights.value=F.state.rectArea,Pt.ltc_1.value=F.state.rectAreaLTC1,Pt.ltc_2.value=F.state.rectAreaLTC2,Pt.pointLights.value=F.state.point,Pt.pointLightShadows.value=F.state.pointShadow,Pt.hemisphereLights.value=F.state.hemi,Pt.directionalShadowMap.value=F.state.directionalShadowMap,Pt.directionalShadowMatrix.value=F.state.directionalShadowMatrix,Pt.spotShadowMap.value=F.state.spotShadowMap,Pt.spotLightMatrix.value=F.state.spotLightMatrix,Pt.spotLightMap.value=F.state.spotLightMap,Pt.pointShadowMap.value=F.state.pointShadowMap,Pt.pointShadowMatrix.value=F.state.pointShadowMatrix),z.currentProgram=Rt,z.uniformsList=null,Rt}function Fr(x){if(x.uniformsList===null){const I=x.currentProgram.getUniforms();x.uniformsList=fs.seqWithValue(I.seq,x.uniforms)}return x.uniformsList}function Or(x,I){const B=Ut.get(x);B.outputColorSpace=I.outputColorSpace,B.batching=I.batching,B.instancing=I.instancing,B.instancingColor=I.instancingColor,B.skinning=I.skinning,B.morphTargets=I.morphTargets,B.morphNormals=I.morphNormals,B.morphColors=I.morphColors,B.morphTargetsCount=I.morphTargetsCount,B.numClippingPlanes=I.numClippingPlanes,B.numIntersection=I.numClipIntersection,B.vertexAlphas=I.vertexAlphas,B.vertexTangents=I.vertexTangents,B.toneMapping=I.toneMapping}function al(x,I,B,z,F){I.isScene!==!0&&(I=Et),S.resetTextureUnits();const ht=I.fog,mt=z.isMeshStandardMaterial?I.environment:null,St=w===null?y.outputColorSpace:w.isXRRenderTarget===!0?w.texture.colorSpace:dn,At=(z.isMeshStandardMaterial?O:v).get(z.envMap||mt),Ft=z.vertexColors===!0&&!!B.attributes.color&&B.attributes.color.itemSize===4,Rt=!!B.attributes.tangent&&(!!z.normalMap||z.anisotropy>0),Pt=!!B.morphAttributes.position,se=!!B.morphAttributes.normal,De=!!B.morphAttributes.color;let he=Tn;z.toneMapped&&(w===null||w.isXRRenderTarget===!0)&&(he=y.toneMapping);const en=B.morphAttributes.position||B.morphAttributes.normal||B.morphAttributes.color,ee=en!==void 0?en.length:0,Bt=Ut.get(z),Rs=f.state.lights;if(K===!0&&(ct===!0||x!==M)){const Oe=x===M&&z.id===$;Nt.setState(z,x,Oe)}let ie=!1;z.version===Bt.__version?(Bt.needsLights&&Bt.lightsStateVersion!==Rs.state.version||Bt.outputColorSpace!==St||F.isBatchedMesh&&Bt.batching===!1||!F.isBatchedMesh&&Bt.batching===!0||F.isInstancedMesh&&Bt.instancing===!1||!F.isInstancedMesh&&Bt.instancing===!0||F.isSkinnedMesh&&Bt.skinning===!1||!F.isSkinnedMesh&&Bt.skinning===!0||F.isInstancedMesh&&Bt.instancingColor===!0&&F.instanceColor===null||F.isInstancedMesh&&Bt.instancingColor===!1&&F.instanceColor!==null||Bt.envMap!==At||z.fog===!0&&Bt.fog!==ht||Bt.numClippingPlanes!==void 0&&(Bt.numClippingPlanes!==Nt.numPlanes||Bt.numIntersection!==Nt.numIntersection)||Bt.vertexAlphas!==Ft||Bt.vertexTangents!==Rt||Bt.morphTargets!==Pt||Bt.morphNormals!==se||Bt.morphColors!==De||Bt.toneMapping!==he||wt.isWebGL2===!0&&Bt.morphTargetsCount!==ee)&&(ie=!0):(ie=!0,Bt.__version=z.version);let wn=Bt.currentProgram;ie===!0&&(wn=Hi(z,I,F));let Br=!1,Si=!1,Cs=!1;const me=wn.getUniforms(),Rn=Bt.uniforms;if(ft.useProgram(wn.program)&&(Br=!0,Si=!0,Cs=!0),z.id!==$&&($=z.id,Si=!0),Br||M!==x){me.setValue(N,"projectionMatrix",x.projectionMatrix),me.setValue(N,"viewMatrix",x.matrixWorldInverse);const Oe=me.map.cameraPosition;Oe!==void 0&&Oe.setValue(N,Lt.setFromMatrixPosition(x.matrixWorld)),wt.logarithmicDepthBuffer&&me.setValue(N,"logDepthBufFC",2/(Math.log(x.far+1)/Math.LN2)),(z.isMeshPhongMaterial||z.isMeshToonMaterial||z.isMeshLambertMaterial||z.isMeshBasicMaterial||z.isMeshStandardMaterial||z.isShaderMaterial)&&me.setValue(N,"isOrthographic",x.isOrthographicCamera===!0),M!==x&&(M=x,Si=!0,Cs=!0)}if(F.isSkinnedMesh){me.setOptional(N,F,"bindMatrix"),me.setOptional(N,F,"bindMatrixInverse");const Oe=F.skeleton;Oe&&(wt.floatVertexTextures?(Oe.boneTexture===null&&Oe.computeBoneTexture(),me.setValue(N,"boneTexture",Oe.boneTexture,S)):console.warn("THREE.WebGLRenderer: SkinnedMesh can only be used with WebGL 2. With WebGL 1 OES_texture_float and vertex textures support is required."))}F.isBatchedMesh&&(me.setOptional(N,F,"batchingTexture"),me.setValue(N,"batchingTexture",F._matricesTexture,S));const Ps=B.morphAttributes;if((Ps.position!==void 0||Ps.normal!==void 0||Ps.color!==void 0&&wt.isWebGL2===!0)&&Ht.update(F,B,wn),(Si||Bt.receiveShadow!==F.receiveShadow)&&(Bt.receiveShadow=F.receiveShadow,me.setValue(N,"receiveShadow",F.receiveShadow)),z.isMeshGouraudMaterial&&z.envMap!==null&&(Rn.envMap.value=At,Rn.flipEnvMap.value=At.isCubeTexture&&At.isRenderTargetTexture===!1?-1:1),Si&&(me.setValue(N,"toneMappingExposure",y.toneMappingExposure),Bt.needsLights&&ol(Rn,Cs),ht&&z.fog===!0&&lt.refreshFogUniforms(Rn,ht),lt.refreshMaterialUniforms(Rn,z,Y,k,_t),fs.upload(N,Fr(Bt),Rn,S)),z.isShaderMaterial&&z.uniformsNeedUpdate===!0&&(fs.upload(N,Fr(Bt),Rn,S),z.uniformsNeedUpdate=!1),z.isSpriteMaterial&&me.setValue(N,"center",F.center),me.setValue(N,"modelViewMatrix",F.modelViewMatrix),me.setValue(N,"normalMatrix",F.normalMatrix),me.setValue(N,"modelMatrix",F.matrixWorld),z.isShaderMaterial||z.isRawShaderMaterial){const Oe=z.uniformsGroups;for(let Ls=0,cl=Oe.length;Ls<cl;Ls++)if(wt.isWebGL2){const zr=Oe[Ls];Xt.update(zr,wn),Xt.bind(zr,wn)}else console.warn("THREE.WebGLRenderer: Uniform Buffer Objects can only be used with WebGL 2.")}return wn}function ol(x,I){x.ambientLightColor.needsUpdate=I,x.lightProbe.needsUpdate=I,x.directionalLights.needsUpdate=I,x.directionalLightShadows.needsUpdate=I,x.pointLights.needsUpdate=I,x.pointLightShadows.needsUpdate=I,x.spotLights.needsUpdate=I,x.spotLightShadows.needsUpdate=I,x.rectAreaLights.needsUpdate=I,x.hemisphereLights.needsUpdate=I}function ll(x){return x.isMeshLambertMaterial||x.isMeshToonMaterial||x.isMeshPhongMaterial||x.isMeshStandardMaterial||x.isShadowMaterial||x.isShaderMaterial&&x.lights===!0}this.getActiveCubeFace=function(){return C},this.getActiveMipmapLevel=function(){return b},this.getRenderTarget=function(){return w},this.setRenderTargetTextures=function(x,I,B){Ut.get(x.texture).__webglTexture=I,Ut.get(x.depthTexture).__webglTexture=B;const z=Ut.get(x);z.__hasExternalTextures=!0,z.__hasExternalTextures&&(z.__autoAllocateDepthBuffer=B===void 0,z.__autoAllocateDepthBuffer||xt.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),z.__useRenderToTexture=!1))},this.setRenderTargetFramebuffer=function(x,I){const B=Ut.get(x);B.__webglFramebuffer=I,B.__useDefaultFramebuffer=I===void 0},this.setRenderTarget=function(x,I=0,B=0){w=x,C=I,b=B;let z=!0,F=null,ht=!1,mt=!1;if(x){const At=Ut.get(x);At.__useDefaultFramebuffer!==void 0?(ft.bindFramebuffer(N.FRAMEBUFFER,null),z=!1):At.__webglFramebuffer===void 0?S.setupRenderTarget(x):At.__hasExternalTextures&&S.rebindTextures(x,Ut.get(x.texture).__webglTexture,Ut.get(x.depthTexture).__webglTexture);const Ft=x.texture;(Ft.isData3DTexture||Ft.isDataArrayTexture||Ft.isCompressedArrayTexture)&&(mt=!0);const Rt=Ut.get(x).__webglFramebuffer;x.isWebGLCubeRenderTarget?(Array.isArray(Rt[I])?F=Rt[I][B]:F=Rt[I],ht=!0):wt.isWebGL2&&x.samples>0&&S.useMultisampledRTT(x)===!1?F=Ut.get(x).__webglMultisampledFramebuffer:Array.isArray(Rt)?F=Rt[B]:F=Rt,E.copy(x.viewport),V.copy(x.scissor),W=x.scissorTest}else E.copy(j).multiplyScalar(Y).floor(),V.copy(et).multiplyScalar(Y).floor(),W=it;if(ft.bindFramebuffer(N.FRAMEBUFFER,F)&&wt.drawBuffers&&z&&ft.drawBuffers(x,F),ft.viewport(E),ft.scissor(V),ft.setScissorTest(W),ht){const At=Ut.get(x.texture);N.framebufferTexture2D(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_CUBE_MAP_POSITIVE_X+I,At.__webglTexture,B)}else if(mt){const At=Ut.get(x.texture),Ft=I||0;N.framebufferTextureLayer(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0,At.__webglTexture,B||0,Ft)}$=-1},this.readRenderTargetPixels=function(x,I,B,z,F,ht,mt){if(!(x&&x.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let St=Ut.get(x).__webglFramebuffer;if(x.isWebGLCubeRenderTarget&&mt!==void 0&&(St=St[mt]),St){ft.bindFramebuffer(N.FRAMEBUFFER,St);try{const At=x.texture,Ft=At.format,Rt=At.type;if(Ft!==Ye&&dt.convert(Ft)!==N.getParameter(N.IMPLEMENTATION_COLOR_READ_FORMAT)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}const Pt=Rt===Ii&&(xt.has("EXT_color_buffer_half_float")||wt.isWebGL2&&xt.has("EXT_color_buffer_float"));if(Rt!==An&&dt.convert(Rt)!==N.getParameter(N.IMPLEMENTATION_COLOR_READ_TYPE)&&!(Rt===Sn&&(wt.isWebGL2||xt.has("OES_texture_float")||xt.has("WEBGL_color_buffer_float")))&&!Pt){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}I>=0&&I<=x.width-z&&B>=0&&B<=x.height-F&&N.readPixels(I,B,z,F,dt.convert(Ft),dt.convert(Rt),ht)}finally{const At=w!==null?Ut.get(w).__webglFramebuffer:null;ft.bindFramebuffer(N.FRAMEBUFFER,At)}}},this.copyFramebufferToTexture=function(x,I,B=0){const z=Math.pow(2,-B),F=Math.floor(I.image.width*z),ht=Math.floor(I.image.height*z);S.setTexture2D(I,0),N.copyTexSubImage2D(N.TEXTURE_2D,B,0,0,x.x,x.y,F,ht),ft.unbindTexture()},this.copyTextureToTexture=function(x,I,B,z=0){const F=I.image.width,ht=I.image.height,mt=dt.convert(B.format),St=dt.convert(B.type);S.setTexture2D(B,0),N.pixelStorei(N.UNPACK_FLIP_Y_WEBGL,B.flipY),N.pixelStorei(N.UNPACK_PREMULTIPLY_ALPHA_WEBGL,B.premultiplyAlpha),N.pixelStorei(N.UNPACK_ALIGNMENT,B.unpackAlignment),I.isDataTexture?N.texSubImage2D(N.TEXTURE_2D,z,x.x,x.y,F,ht,mt,St,I.image.data):I.isCompressedTexture?N.compressedTexSubImage2D(N.TEXTURE_2D,z,x.x,x.y,I.mipmaps[0].width,I.mipmaps[0].height,mt,I.mipmaps[0].data):N.texSubImage2D(N.TEXTURE_2D,z,x.x,x.y,mt,St,I.image),z===0&&B.generateMipmaps&&N.generateMipmap(N.TEXTURE_2D),ft.unbindTexture()},this.copyTextureToTexture3D=function(x,I,B,z,F=0){if(y.isWebGL1Renderer){console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: can only be used with WebGL2.");return}const ht=x.max.x-x.min.x+1,mt=x.max.y-x.min.y+1,St=x.max.z-x.min.z+1,At=dt.convert(z.format),Ft=dt.convert(z.type);let Rt;if(z.isData3DTexture)S.setTexture3D(z,0),Rt=N.TEXTURE_3D;else if(z.isDataArrayTexture||z.isCompressedArrayTexture)S.setTexture2DArray(z,0),Rt=N.TEXTURE_2D_ARRAY;else{console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");return}N.pixelStorei(N.UNPACK_FLIP_Y_WEBGL,z.flipY),N.pixelStorei(N.UNPACK_PREMULTIPLY_ALPHA_WEBGL,z.premultiplyAlpha),N.pixelStorei(N.UNPACK_ALIGNMENT,z.unpackAlignment);const Pt=N.getParameter(N.UNPACK_ROW_LENGTH),se=N.getParameter(N.UNPACK_IMAGE_HEIGHT),De=N.getParameter(N.UNPACK_SKIP_PIXELS),he=N.getParameter(N.UNPACK_SKIP_ROWS),en=N.getParameter(N.UNPACK_SKIP_IMAGES),ee=B.isCompressedTexture?B.mipmaps[F]:B.image;N.pixelStorei(N.UNPACK_ROW_LENGTH,ee.width),N.pixelStorei(N.UNPACK_IMAGE_HEIGHT,ee.height),N.pixelStorei(N.UNPACK_SKIP_PIXELS,x.min.x),N.pixelStorei(N.UNPACK_SKIP_ROWS,x.min.y),N.pixelStorei(N.UNPACK_SKIP_IMAGES,x.min.z),B.isDataTexture||B.isData3DTexture?N.texSubImage3D(Rt,F,I.x,I.y,I.z,ht,mt,St,At,Ft,ee.data):B.isCompressedArrayTexture?(console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: untested support for compressed srcTexture."),N.compressedTexSubImage3D(Rt,F,I.x,I.y,I.z,ht,mt,St,At,ee.data)):N.texSubImage3D(Rt,F,I.x,I.y,I.z,ht,mt,St,At,Ft,ee),N.pixelStorei(N.UNPACK_ROW_LENGTH,Pt),N.pixelStorei(N.UNPACK_IMAGE_HEIGHT,se),N.pixelStorei(N.UNPACK_SKIP_PIXELS,De),N.pixelStorei(N.UNPACK_SKIP_ROWS,he),N.pixelStorei(N.UNPACK_SKIP_IMAGES,en),F===0&&z.generateMipmaps&&N.generateMipmap(Rt),ft.unbindTexture()},this.initTexture=function(x){x.isCubeTexture?S.setTextureCube(x,0):x.isData3DTexture?S.setTexture3D(x,0):x.isDataArrayTexture||x.isCompressedArrayTexture?S.setTexture2DArray(x,0):S.setTexture2D(x,0),ft.unbindTexture()},this.resetState=function(){C=0,b=0,w=null,ft.reset(),Dt.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return cn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;const e=this.getContext();e.drawingBufferColorSpace=t===wr?"display-p3":"srgb",e.unpackColorSpace=Yt.workingColorSpace===As?"display-p3":"srgb"}get outputEncoding(){return console.warn("THREE.WebGLRenderer: Property .outputEncoding has been removed. Use .outputColorSpace instead."),this.outputColorSpace===fe?zn:Po}set outputEncoding(t){console.warn("THREE.WebGLRenderer: Property .outputEncoding has been removed. Use .outputColorSpace instead."),this.outputColorSpace=t===zn?fe:dn}get useLegacyLights(){return console.warn("THREE.WebGLRenderer: The property .useLegacyLights has been deprecated. Migrate your lighting according to the following guide: https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733."),this._useLegacyLights}set useLegacyLights(t){console.warn("THREE.WebGLRenderer: The property .useLegacyLights has been deprecated. Migrate your lighting according to the following guide: https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733."),this._useLegacyLights=t}}class vp extends Qo{}vp.prototype.isWebGL1Renderer=!0;class xp extends we{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){const e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(e.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(e.object.backgroundIntensity=this.backgroundIntensity),e}}class Mp extends un{constructor(t){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new Gt(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.size=t.size,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}}const ro=new re,yr=new Bo,hs=new bs,us=new D;class Sp extends we{constructor(t=new Ke,e=new Mp){super(),this.isPoints=!0,this.type="Points",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}raycast(t,e){const n=this.geometry,s=this.matrixWorld,r=t.params.Points.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),hs.copy(n.boundingSphere),hs.applyMatrix4(s),hs.radius+=r,t.ray.intersectsSphere(hs)===!1)return;ro.copy(s).invert(),yr.copy(t.ray).applyMatrix4(ro);const a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=n.index,d=n.attributes.position;if(c!==null){const p=Math.max(0,o.start),m=Math.min(c.count,o.start+o.count);for(let _=p,g=m;_<g;_++){const f=c.getX(_);us.fromBufferAttribute(d,f),ao(us,f,l,s,t,e,this)}}else{const p=Math.max(0,o.start),m=Math.min(d.count,o.start+o.count);for(let _=p,g=m;_<g;_++)us.fromBufferAttribute(d,_),ao(us,_,l,s,t,e,this)}}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}}function ao(i,t,e,n,s,r,o){const a=yr.distanceSqToPoint(i);if(a<e){const l=new D;yr.closestPointToPoint(i,l),l.applyMatrix4(n);const c=s.ray.origin.distanceTo(l);if(c<s.near||c>s.far)return;r.push({distance:c,distanceToRay:Math.sqrt(a),point:l,index:t,face:null,object:o})}}class yp extends Le{constructor(t,e,n,s,r,o,a,l,c){super(t,e,n,s,r,o,a,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}}class Lr extends Ke{constructor(t=.5,e=1,n=32,s=1,r=0,o=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:t,outerRadius:e,thetaSegments:n,phiSegments:s,thetaStart:r,thetaLength:o},n=Math.max(3,n),s=Math.max(1,s);const a=[],l=[],c=[],h=[];let d=t;const p=(e-t)/s,m=new D,_=new kt;for(let g=0;g<=s;g++){for(let f=0;f<=n;f++){const u=r+f/n*o;m.x=d*Math.cos(u),m.y=d*Math.sin(u),l.push(m.x,m.y,m.z),c.push(0,0,1),_.x=(m.x/e+1)/2,_.y=(m.y/e+1)/2,h.push(_.x,_.y)}d+=p}for(let g=0;g<s;g++){const f=g*(n+1);for(let u=0;u<n;u++){const T=u+f,y=T,A=T+n+1,C=T+n+2,b=T+1;a.push(y,A,b),a.push(A,C,b)}}this.setIndex(a),this.setAttribute("position",new Fe(l,3)),this.setAttribute("normal",new Fe(c,3)),this.setAttribute("uv",new Fe(h,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Lr(t.innerRadius,t.outerRadius,t.thetaSegments,t.phiSegments,t.thetaStart,t.thetaLength)}}class Ss extends Ke{constructor(t=1,e=32,n=16,s=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:n,phiStart:s,phiLength:r,thetaStart:o,thetaLength:a},e=Math.max(3,Math.floor(e)),n=Math.max(2,Math.floor(n));const l=Math.min(o+a,Math.PI);let c=0;const h=[],d=new D,p=new D,m=[],_=[],g=[],f=[];for(let u=0;u<=n;u++){const T=[],y=u/n;let A=0;u===0&&o===0?A=.5/e:u===n&&l===Math.PI&&(A=-.5/e);for(let C=0;C<=e;C++){const b=C/e;d.x=-t*Math.cos(s+b*r)*Math.sin(o+y*a),d.y=t*Math.cos(o+y*a),d.z=t*Math.sin(s+b*r)*Math.sin(o+y*a),_.push(d.x,d.y,d.z),p.copy(d).normalize(),g.push(p.x,p.y,p.z),f.push(b+A,1-y),T.push(c++)}h.push(T)}for(let u=0;u<n;u++)for(let T=0;T<e;T++){const y=h[u][T+1],A=h[u][T],C=h[u+1][T],b=h[u+1][T+1];(u!==0||o>0)&&m.push(y,A,b),(u!==n-1||l<Math.PI)&&m.push(A,C,b)}this.setIndex(m),this.setAttribute("position",new Fe(_,3)),this.setAttribute("normal",new Fe(g,3)),this.setAttribute("uv",new Fe(f,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Ss(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}}class Ep extends un{constructor(t){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.type="MeshStandardMaterial",this.color=new Gt(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Gt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Lo,this.normalScale=new kt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}}class tl extends we{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new Gt(t),this.intensity=e}dispose(){}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){const e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,this.groundColor!==void 0&&(e.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(e.object.distance=this.distance),this.angle!==void 0&&(e.object.angle=this.angle),this.decay!==void 0&&(e.object.decay=this.decay),this.penumbra!==void 0&&(e.object.penumbra=this.penumbra),this.shadow!==void 0&&(e.object.shadow=this.shadow.toJSON()),e}}const cr=new re,oo=new D,lo=new D;class Tp{constructor(t){this.camera=t,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new kt(512,512),this.map=null,this.mapPass=null,this.matrix=new re,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Rr,this._frameExtents=new kt(1,1),this._viewportCount=1,this._viewports=[new Qt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(t){const e=this.camera,n=this.matrix;oo.setFromMatrixPosition(t.matrixWorld),e.position.copy(oo),lo.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(lo),e.updateMatrixWorld(),cr.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),this._frustum.setFromProjectionMatrix(cr),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(cr)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.bias=t.bias,this.radius=t.radius,this.mapSize.copy(t.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const t={};return this.bias!==0&&(t.bias=this.bias),this.normalBias!==0&&(t.normalBias=this.normalBias),this.radius!==1&&(t.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(t.mapSize=this.mapSize.toArray()),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}}const co=new re,wi=new D,hr=new D;class Ap extends Tp{constructor(){super(new Ne(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new kt(4,2),this._viewportCount=6,this._viewports=[new Qt(2,1,1,1),new Qt(0,1,1,1),new Qt(3,1,1,1),new Qt(1,1,1,1),new Qt(3,0,1,1),new Qt(1,0,1,1)],this._cubeDirections=[new D(1,0,0),new D(-1,0,0),new D(0,0,1),new D(0,0,-1),new D(0,1,0),new D(0,-1,0)],this._cubeUps=[new D(0,1,0),new D(0,1,0),new D(0,1,0),new D(0,1,0),new D(0,0,1),new D(0,0,-1)]}updateMatrices(t,e=0){const n=this.camera,s=this.matrix,r=t.distance||n.far;r!==n.far&&(n.far=r,n.updateProjectionMatrix()),wi.setFromMatrixPosition(t.matrixWorld),n.position.copy(wi),hr.copy(n.position),hr.add(this._cubeDirections[e]),n.up.copy(this._cubeUps[e]),n.lookAt(hr),n.updateMatrixWorld(),s.makeTranslation(-wi.x,-wi.y,-wi.z),co.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(co)}}class bp extends tl{constructor(t,e,n=0,s=2){super(t,e),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=s,this.shadow=new Ap}get power(){return this.intensity*4*Math.PI}set power(t){this.intensity=t/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(t,e){return super.copy(t,e),this.distance=t.distance,this.decay=t.decay,this.shadow=t.shadow.clone(),this}}class wp extends tl{constructor(t,e){super(t,e),this.isAmbientLight=!0,this.type="AmbientLight"}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Ar}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Ar);const gi=66743e-15,ve=149597870700,ho=0x6da012f95c9e88,uo=9460730472580800,Re=198892e25,hn=59722e20,_i=7342e19,ys=1898e24,je=69634e4,el=6371e3,nl=1737400,il=69911e3,Gn=3828e23,Ve=86400,Rp=60,sl=1/Rp,ur=sl,Cp=1e3,Pp=.5,Lp=5,Dp=1e3,fo=1e8;function Ri(i){const t=Math.abs(i);return t>=ho?`${(i/ho).toFixed(2)} pc`:t>=uo?`${(i/uo).toFixed(2)} ly`:t>=ve*.01?`${(i/ve).toFixed(4)} AU`:t>=1e9?`${(i/1e9).toFixed(2)} Gm`:t>=1e6?`${(i/1e6).toFixed(2)} Mm`:t>=1e3?`${(i/1e3).toFixed(2)} km`:t>=1?`${i.toFixed(2)} m`:t>=.001?`${(i*1e3).toFixed(2)} mm`:`${i.toExponential(2)} m`}function Ip(i){const t=Math.abs(i);return t>=Re*.01?`${(i/Re).toFixed(4)} M☉`:t>=ys*.01?`${(i/ys).toFixed(4)} MJ`:t>=hn*.01?`${(i/hn).toFixed(4)} M⊕`:t>=_i*.01?`${(i/_i).toFixed(4)} ML`:t>=1e12?`${(i/1e12).toFixed(2)} Tt`:t>=1e9?`${(i/1e9).toFixed(2)} Gt`:t>=1e6?`${(i/1e6).toFixed(2)} Mt`:t>=1e3?`${(i/1e3).toFixed(2)} t`:`${i.toFixed(2)} kg`}class U{constructor(t=0,e=0,n=0){L(this,"x");L(this,"y");L(this,"z");this.x=t,this.y=e,this.z=n}static fromFloat64Array(t,e=0){return new U(t[e]??0,t[e+1]??0,t[e+2]??0)}static fromFloat32Array(t,e=0){return new U(t[e]??0,t[e+1]??0,t[e+2]??0)}clone(){return new U(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}set(t,e,n){return this.x=t,this.y=e,this.z=n,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}static add(t,e){return new U(t.x+e.x,t.y+e.y,t.z+e.z)}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}static sub(t,e){return new U(t.x-e.x,t.y-e.y,t.z-e.z)}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}static multiplyScalar(t,e){return new U(t.x*e,t.y*e,t.z*e)}divideScalar(t){if(t===0)throw new Error("Vector3.divideScalar: Cannot divide by zero");return this.multiplyScalar(1/t)}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}static dot(t,e){return t.x*e.x+t.y*e.y+t.z*e.z}cross(t){const e=this.y*t.z-this.z*t.y,n=this.z*t.x-this.x*t.z,s=this.x*t.y-this.y*t.x;return this.x=e,this.y=n,this.z=s,this}static cross(t,e){return new U(t.y*e.z-t.z*e.y,t.z*e.x-t.x*e.z,t.x*e.y-t.y*e.x)}lengthSquared(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.lengthSquared())}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,n=this.y-t.y,s=this.z-t.z;return e*e+n*n+s*s}normalize(){const t=this.length();if(t===0)throw new Error("Vector3.normalize: Cannot normalize zero-length vector");return this.divideScalar(t)}safeNormalize(){const t=this.length();return t===0?this.set(0,0,0):this.divideScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}static lerp(t,e,n){return new U(t.x+(e.x-t.x)*n,t.y+(e.y-t.y)*n,t.z+(e.z-t.z)*n)}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}equals(t,e=1e-10){return Math.abs(this.x-t.x)<e&&Math.abs(this.y-t.y)<e&&Math.abs(this.z-t.z)<e}isZero(t=1e-10){return this.lengthSquared()<t*t}toFloat64Array(t,e=0){const n=t??new Float64Array(3);return n[e]=this.x,n[e+1]=this.y,n[e+2]=this.z,n}toFloat32Array(t,e=0){const n=t??new Float32Array(3);return n[e]=this.x,n[e+1]=this.y,n[e+2]=this.z,n}toRenderPosition(t){return new Float32Array([this.x-t.x,this.y-t.y,this.z-t.z])}toArray(){return[this.x,this.y,this.z]}static fromArray(t){return new U(t[0]??0,t[1]??0,t[2]??0)}toString(t=6){return`Vector3(${this.x.toExponential(t)}, ${this.y.toExponential(t)}, ${this.z.toExponential(t)})`}applyFunc(t){return this.x=t(this.x),this.y=t(this.y),this.z=t(this.z),this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this}clampLength(t){const e=this.length();return e>t&&e>0&&this.multiplyScalar(t/e),this}projectOnto(t){const e=t.lengthSquared();if(e===0)throw new Error("Vector3.projectOnto: Cannot project onto zero-length vector");const n=this.dot(t)/e;return this.copy(t).multiplyScalar(n)}reflect(t){const e=2*this.dot(t);return this.x-=e*t.x,this.y-=e*t.y,this.z-=e*t.z,this}angleTo(t){const e=Math.sqrt(this.lengthSquared()*t.lengthSquared());if(e===0)throw new Error("Vector3.angleTo: Cannot compute angle with zero-length vector");const n=this.dot(t)/e;return Math.acos(Math.max(-1,Math.min(1,n)))}static zero(){return new U(0,0,0)}static unitX(){return new U(1,0,0)}static unitY(){return new U(0,1,0)}static unitZ(){return new U(0,0,1)}}class $t{constructor(t=0,e=0,n=0,s=1){L(this,"x");L(this,"y");L(this,"z");L(this,"w");this.x=t,this.y=e,this.z=n,this.w=s}static identity(){return new $t(0,0,0,1)}clone(){return new $t(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w,this}set(t,e,n,s){return this.x=t,this.y=e,this.z=n,this.w=s,this}setFromAxisAngle(t,e){const n=e/2,s=Math.sin(n);return this.x=t.x*s,this.y=t.y*s,this.z=t.z*s,this.w=Math.cos(n),this}setFromEuler(t,e,n){const s=Math.cos(t/2),r=Math.cos(e/2),o=Math.cos(n/2),a=Math.sin(t/2),l=Math.sin(e/2),c=Math.sin(n/2);return this.x=a*r*o+s*l*c,this.y=s*l*o-a*r*c,this.z=s*r*c+a*l*o,this.w=s*r*o-a*l*c,this}toEuler(){const t=2*(this.w*this.x+this.y*this.z),e=1-2*(this.x*this.x+this.y*this.y),n=Math.atan2(t,e),s=2*(this.w*this.y-this.z*this.x);let r;Math.abs(s)>=1?r=Math.sign(s)*Math.PI/2:r=Math.asin(s);const o=2*(this.w*this.z+this.x*this.y),a=1-2*(this.y*this.y+this.z*this.z),l=Math.atan2(o,a);return{x:n,y:r,z:l}}lengthSquared(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.lengthSquared())}normalize(){const t=this.length();if(t===0)this.x=0,this.y=0,this.z=0,this.w=1;else{const e=1/t;this.x*=e,this.y*=e,this.z*=e,this.w*=e}return this}conjugate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}multiply(t){const e=this.x,n=this.y,s=this.z,r=this.w,o=t.x,a=t.y,l=t.z,c=t.w;return this.x=e*c+r*o+n*l-s*a,this.y=n*c+r*a+s*o-e*l,this.z=s*c+r*l+e*a-n*o,this.w=r*c-e*o-n*a-s*l,this}static multiply(t,e){return t.clone().multiply(e)}premultiply(t){const e=t.x,n=t.y,s=t.z,r=t.w,o=this.x,a=this.y,l=this.z,c=this.w;return this.x=e*c+r*o+n*l-s*a,this.y=n*c+r*a+s*o-e*l,this.z=s*c+r*l+e*a-n*o,this.w=r*c-e*o-n*a-s*l,this}rotateVector(t){const e=this.x,n=this.y,s=this.z,r=this.w,o=t.x,a=t.y,l=t.z,c=r*o+n*l-s*a,h=r*a+s*o-e*l,d=r*l+e*a-n*o,p=-e*o-n*a-s*l;return new U(c*r+p*-e+h*-s-d*-n,h*r+p*-n+d*-e-c*-s,d*r+p*-s+c*-n-h*-e)}slerp(t,e){if(e===0)return this;if(e===1)return this.copy(t);let n=this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w,s=t.x,r=t.y,o=t.z,a=t.w;if(n<0&&(s=-s,r=-r,o=-o,a=-a,n=-n),n>=1)return this;const l=1-n*n;if(l<=Number.EPSILON){const m=1-e;return this.x=m*this.x+e*s,this.y=m*this.y+e*r,this.z=m*this.z+e*o,this.w=m*this.w+e*a,this.normalize()}const c=Math.sqrt(l),h=Math.atan2(c,n),d=Math.sin((1-e)*h)/c,p=Math.sin(e*h)/c;return this.x=this.x*d+s*p,this.y=this.y*d+r*p,this.z=this.z*d+o*p,this.w=this.w*d+a*p,this}static slerp(t,e,n){return t.clone().slerp(e,n)}static fromVectors(t,e){const n=new $t,s=t.dot(e);if(s<-.999999){let r=U.cross(U.unitX(),t);r.lengthSquared()<1e-6&&(r=U.cross(U.unitY(),t)),r.normalize(),n.setFromAxisAngle(r,Math.PI)}else if(s>.999999)n.set(0,0,0,1);else{const r=U.cross(t,e);n.x=r.x,n.y=r.y,n.z=r.z,n.w=1+s,n.normalize()}return n}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}equals(t,e=1e-10){return Math.abs(this.x-t.x)<e&&Math.abs(this.y-t.y)<e&&Math.abs(this.z-t.z)<e&&Math.abs(this.w-t.w)<e}toArray(){return[this.x,this.y,this.z,this.w]}static fromArray(t){return new $t(t[0]??0,t[1]??0,t[2]??0,t[3]??1)}toString(){return`Quaternion(${this.x.toFixed(6)}, ${this.y.toFixed(6)}, ${this.z.toFixed(6)}, ${this.w.toFixed(6)})`}getAxis(){const t=Math.sqrt(1-this.w*this.w);return t<1e-4?new U(1,0,0):new U(this.x/t,this.y/t,this.z/t)}getAngle(){return 2*Math.acos(Math.max(-1,Math.min(1,this.w)))}}class Ui{constructor(t=Date.now()){L(this,"state");this.state=new Uint32Array(4),this.seed(t)}seed(t){let n=(typeof t=="string"?this.hashString(t):t)>>>0;for(let s=0;s<4;s++){n=n+2654435769>>>0;let r=n;r=(r^r>>>16)*2246822507>>>0,r=(r^r>>>13)*3266489909>>>0,r=(r^r>>>16)>>>0,this.state[s]=r}for(let s=0;s<20;s++)this.next()}hashString(t){let e=0;for(let n=0;n<t.length;n++){const s=t.charCodeAt(n);e=(e<<5)-e+s>>>0}return e}rotl(t,e){return(t<<e|t>>>32-e)>>>0}next(){const t=this.state,e=this.rotl(t[1]*5>>>0,7)*9>>>0,n=t[1]<<9>>>0;return t[2]=(t[2]^t[0])>>>0,t[3]=(t[3]^t[1])>>>0,t[1]=(t[1]^t[2])>>>0,t[0]=(t[0]^t[3])>>>0,t[2]=(t[2]^n)>>>0,t[3]=this.rotl(t[3],11),e}random(){return this.next()/4294967296}range(t,e){return t+this.random()*(e-t)}rangeInt(t,e){return Math.floor(this.range(t,e+1))}gaussian(){const t=this.random(),e=this.random();return Math.sqrt(-2*Math.log(t+1e-10))*Math.cos(2*Math.PI*e)}gaussianRange(t,e){return t+this.gaussian()*e}chance(t=.5){return this.random()<t}pick(t){if(t.length!==0)return t[this.rangeInt(0,t.length-1)]}shuffle(t){for(let e=t.length-1;e>0;e--){const n=this.rangeInt(0,e),s=t[e];t[e]=t[n],t[n]=s}return t}unitVector3(){const t=this.range(0,2*Math.PI),e=Math.acos(this.range(-1,1)),n=Math.sin(e);return{x:n*Math.cos(t),y:n*Math.sin(t),z:Math.cos(e)}}insideSphere(){const t=this.unitVector3(),e=Math.cbrt(this.random());return{x:t.x*e,y:t.y*e,z:t.z*e}}getState(){return Array.from(this.state)}setState(t){for(let e=0;e<4;e++)this.state[e]=t[e]??0}derive(t){const e=new Ui;e.setState(this.getState());const n=typeof t=="string"?this.hashString(t):t;e.state[0]=(e.state[0]^n)>>>0;for(let s=0;s<10;s++)e.next();return e}}new Ui(42);function Vn(i,t){if(i<=0)throw new Error(`circularOrbitalVelocity: Radius must be positive, got ${i}`);if(t<=0)throw new Error(`circularOrbitalVelocity: Central mass must be positive, got ${t}`);const e=gi*t;return Math.sqrt(e/i)}function kn(i,t,e){if(i<=0||t<=0||e<=0)throw new Error("sphereOfInfluence: All parameters must be positive");return i*Math.pow(t/e,2/5)}function Up(i,t){if(t<=0)throw new Error(`surfaceGravity: Radius must be positive, got ${t}`);return gi*i/(t*t)}var xe;(function(i){i.MASSIVE="massive",i.PASSIVE="passive"})(xe||(xe={}));var Wt;(function(i){i.STAR="star",i.BLACK_HOLE="black_hole",i.NEUTRON_STAR="neutron_star",i.PULSAR="pulsar",i.GAS_GIANT="gas_giant",i.ICE_GIANT="ice_giant",i.TERRESTRIAL="terrestrial",i.DWARF_PLANET="dwarf_planet",i.MOON="moon",i.ASTEROID="asteroid",i.COMET="comet",i.SPACECRAFT="spacecraft",i.STATION="station",i.DEBRIS="debris"})(Wt||(Wt={}));var pn;(function(i){i.O="O",i.B="B",i.A="A",i.F="F",i.G="G",i.K="K",i.M="M",i.L="L",i.T="T",i.Y="Y"})(pn||(pn={}));const Np={hasAtmosphere:!0,surfacePressure:101325,scaleHeight:8500,composition:[{gas:"N2",fraction:.78,molarMass:.028},{gas:"O2",fraction:.21,molarMass:.032},{gas:"Ar",fraction:.009,molarMass:.04},{gas:"CO2",fraction:4e-4,molarMass:.044}],rayleighCoefficients:[58e-7,135e-7,331e-7],mieCoefficient:21e-6,mieDirectionality:.758},po={seed:0,terrainType:"rocky",maxDisplacement:1e4,octaves:8,frequency:1,lacunarity:2,persistence:.5,hasLiquid:!1,seaLevel:.5};class ui{constructor(t){L(this,"id");L(this,"name");L(this,"type");L(this,"bodyClass");L(this,"mass");L(this,"radius");L(this,"oblateness");L(this,"rotationPeriod");L(this,"axialTilt");L(this,"softening");L(this,"position");L(this,"velocity");L(this,"orientation");L(this,"angularVelocity");L(this,"acceleration");L(this,"parentId");L(this,"childIds");L(this,"soiRadius");L(this,"color");L(this,"albedo");L(this,"emissive");L(this,"emissiveColor");L(this,"emissiveIntensity");L(this,"atmosphere");L(this,"rings");L(this,"starProperties");L(this,"blackHoleProperties");L(this,"terrain");L(this,"description");L(this,"tags");L(this,"userData");L(this,"stateHistory",[]);L(this,"maxHistoryLength",10);this.id=t.id,this.name=t.name,this.type=t.type,this.bodyClass=t.bodyClass,this.mass=t.mass,this.radius=t.radius,this.oblateness=t.oblateness,this.rotationPeriod=t.rotationPeriod,this.axialTilt=t.axialTilt,this.softening=t.softening||Cp,this.position=t.position.clone(),this.velocity=t.velocity.clone(),this.orientation=t.orientation.clone(),this.angularVelocity=t.angularVelocity,this.acceleration=U.zero(),this.parentId=t.parentId,this.childIds=[...t.childIds],this.soiRadius=t.soiRadius,this.color=[...t.color],this.albedo=t.albedo,this.emissive=t.emissive,this.emissiveColor=t.emissiveColor?[...t.emissiveColor]:void 0,this.emissiveIntensity=t.emissiveIntensity,this.atmosphere=t.atmosphere,this.rings=t.rings,this.starProperties=t.starProperties,this.blackHoleProperties=t.blackHoleProperties,this.terrain=t.terrain,this.description=t.description,this.tags=[...t.tags??[]],this.userData={...t.userData}}get mu(){return gi*this.mass}get surfaceGravity(){return Up(this.mass,this.radius)}get escapeVelocity(){return Math.sqrt(2*this.mu/this.radius)}getOrbitalVelocityAt(t){const e=this.radius+t;return Vn(e,this.mass)}getGravitationalAcceleration(t){const e=t*t+this.softening*this.softening;return this.mu/e}getGravitationalForceOn(t){const e=U.sub(this.position,t.position),n=e.lengthSquared(),s=Math.sqrt(n);if(s<1e-10)throw new Error(`CelestialBody.getGravitationalForceOn: Bodies ${this.id} and ${t.id} are at the same position (collision/singularity)`);const r=n+this.softening*this.softening,o=this.mu/r;return e.multiplyScalar(o/s)}updateSOI(t,e){t>0&&e>0?this.soiRadius=kn(e,this.mass,t):this.soiRadius=1/0}isInSOI(t){return t.distanceTo(this.position)<this.soiRadius}isColliding(t){return t.distanceTo(this.position)<=this.radius}getAltitude(t){return t.distanceTo(this.position)-this.radius}getLocalUp(t){return U.sub(t,this.position).safeNormalize()}getSurfacePosition(t){const e=t.clone().safeNormalize();return U.add(this.position,e.multiplyScalar(this.radius))}getSurfaceVelocity(t){if(this.rotationPeriod===0)return U.zero();const e=2*Math.PI/this.rotationPeriod,n=U.sub(t,this.position),s=this.orientation.rotateVector(new U(0,1,0));return U.cross(s.multiplyScalar(e),n)}updateRotation(t){if(this.rotationPeriod===0)return;const n=2*Math.PI/this.rotationPeriod*t,s=new $t().setFromAxisAngle(new U(0,1,0),n);this.orientation.multiply(s).normalize()}toNetworkState(t){return{id:this.id,p:this.position.toArray(),v:this.velocity.toArray(),o:this.orientation.toArray(),av:this.angularVelocity,t}}applyNetworkState(t){this.position.set(t.p[0],t.p[1],t.p[2]),this.velocity.set(t.v[0],t.v[1],t.v[2]),this.orientation.set(t.o[0],t.o[1],t.o[2],t.o[3]),this.angularVelocity=t.av}addStateSnapshot(t){for(this.stateHistory.push({position:this.position.clone(),velocity:this.velocity.clone(),orientation:this.orientation.clone(),angularVelocity:this.angularVelocity,timestamp:t});this.stateHistory.length>this.maxHistoryLength;)this.stateHistory.shift()}getInterpolatedState(t){if(this.stateHistory.length<2)return null;let e=null,n=null;for(let r=0;r<this.stateHistory.length-1;r++){const o=this.stateHistory[r],a=this.stateHistory[r+1];if(o.timestamp<=t&&a.timestamp>=t){e=o,n=a;break}}if(!e||!n)return this.stateHistory[this.stateHistory.length-1]??null;const s=(t-e.timestamp)/(n.timestamp-e.timestamp);return{position:U.lerp(e.position,n.position,s),velocity:U.lerp(e.velocity,n.velocity,s),orientation:$t.slerp(e.orientation,n.orientation,s),angularVelocity:e.angularVelocity+(n.angularVelocity-e.angularVelocity)*s,timestamp:t}}clone(){return new ui(this.toDefinition())}toDefinition(){return{id:this.id,name:this.name,type:this.type,bodyClass:this.bodyClass,mass:this.mass,radius:this.radius,oblateness:this.oblateness,rotationPeriod:this.rotationPeriod,axialTilt:this.axialTilt,softening:this.softening,position:this.position.clone(),velocity:this.velocity.clone(),orientation:this.orientation.clone(),angularVelocity:this.angularVelocity,parentId:this.parentId,childIds:[...this.childIds],soiRadius:this.soiRadius,color:[...this.color],albedo:this.albedo,emissive:this.emissive,emissiveColor:this.emissiveColor?[...this.emissiveColor]:void 0,emissiveIntensity:this.emissiveIntensity,atmosphere:this.atmosphere,rings:this.rings,starProperties:this.starProperties,blackHoleProperties:this.blackHoleProperties,terrain:this.terrain,description:this.description,tags:[...this.tags],userData:{...this.userData}}}toString(){return`CelestialBody(${this.name}, mass=${this.mass.toExponential(2)}kg, r=${(this.radius/1e3).toFixed(0)}km)`}}function Fp(){return{name:"Empty World",description:"An empty universe ready for creation.",seed:42,bodies:[]}}function Op(){const i={id:"sun",name:"Sun",type:xe.MASSIVE,bodyClass:Wt.STAR,mass:Re,radius:je,oblateness:9e-6,rotationPeriod:25.05*Ve,axialTilt:.1265,softening:je*.01,position:new U(0,0,0),velocity:new U(0,0,0),orientation:$t.identity(),angularVelocity:0,parentId:null,childIds:["earth"],soiRadius:1/0,color:[1,.95,.8],albedo:0,emissive:!0,emissiveColor:[1,.98,.9],emissiveIntensity:1,starProperties:{spectralClass:pn.G,spectralSubclass:2,luminosityClass:"V",temperature:5778,luminosity:Gn,isVariable:!1,hasFlares:!0,flareIntensity:.1}},t=ve,e=Vn(t,Re),n=kn(t,hn,Re),s={id:"earth",name:"Earth",type:xe.MASSIVE,bodyClass:Wt.TERRESTRIAL,mass:hn,radius:el,oblateness:.00335,rotationPeriod:23.9344696*3600,axialTilt:.4091,softening:1e3,position:new U(t,0,0),velocity:new U(0,0,e),orientation:new $t().setFromEuler(.4091,0,0),angularVelocity:0,parentId:"sun",childIds:["moon"],soiRadius:n,color:[.2,.4,.8],albedo:.306,emissive:!1,atmosphere:Np,terrain:{...po,seed:12345,terrainType:"oceanic",maxDisplacement:8848,hasLiquid:!0,seaLevel:.7}},r=3844e5,o=Vn(r,hn),a=kn(r,_i,hn),l={id:"moon",name:"Moon",type:xe.MASSIVE,bodyClass:Wt.MOON,mass:_i,radius:nl,oblateness:.0012,rotationPeriod:27.321661*Ve,axialTilt:.0267,softening:500,position:new U(t+r,0,0),velocity:new U(0,0,e+o),orientation:$t.identity(),angularVelocity:0,parentId:"earth",childIds:[],soiRadius:a,color:[.7,.7,.7],albedo:.12,emissive:!1,terrain:{...po,seed:67890,terrainType:"rocky",maxDisplacement:10786,hasLiquid:!1,seaLevel:0}};return{name:"Sun-Earth-Moon",description:"The Sun, Earth, and Moon system. Verify: Earth orbits in 365.256 days.",seed:12345,bodies:[i,s,l]}}function Bp(){const i={id:"sun",name:"Sun",type:xe.MASSIVE,bodyClass:Wt.STAR,mass:Re,radius:je,oblateness:9e-6,rotationPeriod:25.05*Ve,axialTilt:.1265,softening:je*.01,position:new U(0,0,0),velocity:new U(0,0,0),orientation:$t.identity(),angularVelocity:0,parentId:null,childIds:["mercury","venus","earth","mars","jupiter","saturn","uranus","neptune"],soiRadius:1/0,color:[1,.95,.8],albedo:0,emissive:!0,emissiveColor:[1,.98,.9],emissiveIntensity:1,starProperties:{spectralClass:pn.G,spectralSubclass:2,luminosityClass:"V",temperature:5778,luminosity:Gn,isVariable:!1,hasFlares:!0,flareIntensity:.1}},t=[{id:"mercury",name:"Mercury",mass:33011e19,radius:2439700,sma:.387*ve,rotPeriod:58.646*Ve,tilt:59e-5,color:[.6,.5,.4],bodyClass:Wt.TERRESTRIAL,hasAtmosphere:!1},{id:"venus",name:"Venus",mass:48675e20,radius:6051800,sma:.723*ve,rotPeriod:-243.025*Ve,tilt:3.0944,color:[.9,.8,.5],bodyClass:Wt.TERRESTRIAL,hasAtmosphere:!0},{id:"earth",name:"Earth",mass:hn,radius:el,sma:ve,rotPeriod:23.9344696*3600,tilt:.4091,color:[.2,.4,.8],bodyClass:Wt.TERRESTRIAL,hasAtmosphere:!0},{id:"mars",name:"Mars",mass:64171e19,radius:3389500,sma:1.524*ve,rotPeriod:24.6229*3600,tilt:.4396,color:[.8,.4,.2],bodyClass:Wt.TERRESTRIAL,hasAtmosphere:!0},{id:"jupiter",name:"Jupiter",mass:ys,radius:il,sma:5.203*ve,rotPeriod:9.925*3600,tilt:.0546,color:[.8,.7,.5],bodyClass:Wt.GAS_GIANT,hasAtmosphere:!0},{id:"saturn",name:"Saturn",mass:56834e22,radius:58232e3,sma:9.537*ve,rotPeriod:10.656*3600,tilt:.4665,color:[.9,.85,.6],bodyClass:Wt.GAS_GIANT,hasAtmosphere:!0,rings:!0},{id:"uranus",name:"Uranus",mass:8681e22,radius:25362e3,sma:19.19*ve,rotPeriod:-17.24*3600,tilt:1.7064,color:[.5,.8,.9],bodyClass:Wt.ICE_GIANT,hasAtmosphere:!0,rings:!0},{id:"neptune",name:"Neptune",mass:102413e21,radius:24622e3,sma:30.07*ve,rotPeriod:16.11*3600,tilt:.4943,color:[.2,.3,.9],bodyClass:Wt.ICE_GIANT,hasAtmosphere:!0}],e=[i];for(const a of t){const l=Vn(a.sma,Re),c=kn(a.sma,a.mass,Re),h={id:a.id,name:a.name,type:xe.MASSIVE,bodyClass:a.bodyClass,mass:a.mass,radius:a.radius,oblateness:a.id==="saturn"?.098:a.id==="jupiter"?.065:.003,rotationPeriod:a.rotPeriod,axialTilt:a.tilt,softening:Math.max(1e3,a.radius*.001),position:new U(a.sma,0,0),velocity:new U(0,0,l),orientation:new $t().setFromEuler(a.tilt,0,0),angularVelocity:0,parentId:"sun",childIds:a.id==="earth"?["moon"]:[],soiRadius:c,color:a.color,albedo:a.bodyClass===Wt.GAS_GIANT?.5:.3,emissive:!1,atmosphere:a.hasAtmosphere?{hasAtmosphere:!0,surfacePressure:a.id==="earth"?101325:a.id==="venus"?92e5:1e3,scaleHeight:a.id==="earth"?8500:1e4,composition:[],rayleighCoefficients:a.id==="earth"?[58e-7,135e-7,331e-7]:[1e-6,1e-6,1e-6],mieCoefficient:21e-6,mieDirectionality:.758}:void 0,rings:a.rings?{innerRadius:a.radius*1.5,outerRadius:a.radius*2.5,textureSeed:12345,opacity:.8,color:[.9,.85,.7]}:void 0};e.push(h)}const n=e.find(a=>a.id==="earth").position,s=e.find(a=>a.id==="earth").velocity,r=3844e5,o=Vn(r,hn);return e.push({id:"moon",name:"Moon",type:xe.MASSIVE,bodyClass:Wt.MOON,mass:_i,radius:nl,oblateness:.0012,rotationPeriod:27.321661*Ve,axialTilt:.0267,softening:500,position:U.add(n,new U(r,0,0)),velocity:U.add(s,new U(0,0,o)),orientation:$t.identity(),angularVelocity:0,parentId:"earth",childIds:[],soiRadius:kn(r,_i,hn),color:[.7,.7,.7],albedo:.12,emissive:!1}),{name:"Full Solar System",description:"Complete Solar System with all 8 planets and the Moon.",seed:54321,bodies:e}}function zp(){const i=1.1*Re,t=.907*Re,e=i+t,n=23*ve,s=n*t/e,r=-n*i/e,o=79.91*365.25*Ve,a=2*Math.PI*s/o,l=2*Math.PI*Math.abs(r)/o,c={id:"alpha_centauri_a",name:"Alpha Centauri A",type:xe.MASSIVE,bodyClass:Wt.STAR,mass:i,radius:1.2234*je,oblateness:0,rotationPeriod:22*Ve,axialTilt:0,softening:je*.01,position:new U(s,0,0),velocity:new U(0,0,a),orientation:$t.identity(),angularVelocity:0,parentId:null,childIds:[],soiRadius:1/0,color:[1,.95,.85],albedo:0,emissive:!0,emissiveColor:[1,.95,.85],emissiveIntensity:1.5,starProperties:{spectralClass:pn.G,spectralSubclass:2,luminosityClass:"V",temperature:5790,luminosity:1.519*Gn,isVariable:!1,hasFlares:!0,flareIntensity:.1}},h={id:"alpha_centauri_b",name:"Alpha Centauri B",type:xe.MASSIVE,bodyClass:Wt.STAR,mass:t,radius:.8632*je,oblateness:0,rotationPeriod:41*Ve,axialTilt:0,softening:je*.01,position:new U(r,0,0),velocity:new U(0,0,-l),orientation:$t.identity(),angularVelocity:0,parentId:null,childIds:[],soiRadius:1/0,color:[1,.85,.7],albedo:0,emissive:!0,emissiveColor:[1,.85,.7],emissiveIntensity:.5,starProperties:{spectralClass:pn.K,spectralSubclass:1,luminosityClass:"V",temperature:5260,luminosity:.445*Gn,isVariable:!1,hasFlares:!0,flareIntensity:.15}};return{name:"Alpha Centauri AB",description:"Binary star system 4.37 light-years from Earth. Orbital period: 79.91 years.",seed:98765,bodies:[c,h]}}function Hp(){const i=1.34*Re,t=1e4,e=.34*Re,n=.01*je,s=.84*ve,r=i+e,o=2.5*ys,a=23*ve,l=s*e/r,c=-s*i/r,h=191*Ve,d=2*Math.PI*l/h,p=2*Math.PI*Math.abs(c)/h,m=Vn(a,r),_={id:"psr_b1620_pulsar",name:"PSR B1620-26",type:xe.MASSIVE,bodyClass:Wt.PULSAR,mass:i,radius:t,oblateness:0,rotationPeriod:.011,axialTilt:.1,softening:t,position:new U(l,0,0),velocity:new U(0,0,d),orientation:$t.identity(),angularVelocity:2*Math.PI/.011,parentId:null,childIds:[],soiRadius:1/0,color:[.8,.8,1],albedo:0,emissive:!0,emissiveColor:[.7,.7,1],emissiveIntensity:10,starProperties:{spectralClass:pn.O,spectralSubclass:0,luminosityClass:"Pulsar",temperature:1e6,luminosity:.001*Gn,isVariable:!0,variablePeriod:.011,hasFlares:!1,flareIntensity:0}},g={id:"psr_b1620_wd",name:"WD B1620-26",type:xe.MASSIVE,bodyClass:Wt.STAR,mass:e,radius:n,oblateness:0,rotationPeriod:3600,axialTilt:0,softening:n,position:new U(c,0,0),velocity:new U(0,0,-p),orientation:$t.identity(),angularVelocity:0,parentId:null,childIds:[],soiRadius:1/0,color:[1,1,1],albedo:0,emissive:!0,emissiveColor:[1,1,1],emissiveIntensity:.01,starProperties:{spectralClass:pn.A,spectralSubclass:0,luminosityClass:"WD",temperature:25e3,luminosity:1e-4*Gn,isVariable:!1,hasFlares:!1,flareIntensity:0}},f={id:"psr_b1620_planet",name:"Methuselah (PSR B1620-26 b)",type:xe.MASSIVE,bodyClass:Wt.GAS_GIANT,mass:o,radius:il*1.3,oblateness:.06,rotationPeriod:10*3600,axialTilt:.1,softening:1e4,position:new U(a,0,0),velocity:new U(0,0,m),orientation:$t.identity(),angularVelocity:0,parentId:null,childIds:[],soiRadius:kn(a,o,r),color:[.6,.5,.4],albedo:.5,emissive:!1,atmosphere:{hasAtmosphere:!0,surfacePressure:1e6,scaleHeight:5e4,composition:[],rayleighCoefficients:[1e-6,1e-6,1e-6],mieCoefficient:1e-5,mieDirectionality:.7}};return{name:"PSR B1620-26",description:'Extreme pulsar system with white dwarf companion and ancient circumbinary planet "Methuselah" (~12.7 billion years old).',seed:16200026,bodies:[_,g,f]}}function Gp(){const i=10*Re,t=2*66743e-15*i/(299792458*299792458),e={id:"black_hole",name:"Cygnus X-1 Analog",type:xe.MASSIVE,bodyClass:Wt.BLACK_HOLE,mass:i,radius:t,oblateness:0,rotationPeriod:0,axialTilt:0,softening:t*.1,position:new U(0,0,0),velocity:new U(0,0,0),orientation:$t.identity(),angularVelocity:0,parentId:null,childIds:[],soiRadius:1/0,color:[0,0,0],albedo:0,emissive:!1,blackHoleProperties:{schwarzschildRadius:t,spinParameter:.5,hasAccretionDisk:!0,accretionDiskInner:3,accretionDiskOuter:20,accretionDiskTemperature:1e7}},n=.2*ve,s=Vn(n,i),r={id:"companion_star",name:"HDE 226868 Analog",type:xe.MASSIVE,bodyClass:Wt.STAR,mass:20*Re,radius:20*je,oblateness:.1,rotationPeriod:5.6*Ve,axialTilt:0,softening:je,position:new U(n,0,0),velocity:new U(0,0,s),orientation:$t.identity(),angularVelocity:0,parentId:"black_hole",childIds:[],soiRadius:kn(n,20*Re,i),color:[.8,.85,1],albedo:0,emissive:!0,emissiveColor:[.8,.85,1],emissiveIntensity:50,starProperties:{spectralClass:pn.O,spectralSubclass:9,luminosityClass:"Iab",temperature:31e3,luminosity:3e5*Gn,isVariable:!0,variablePeriod:5.6*Ve,hasFlares:!0,flareIntensity:1}};return{name:"Black Hole System",description:"Stellar-mass black hole with accretion disk and companion star. Tests gravitational lensing.",seed:666666,bodies:[e,r]}}function Vp(i){switch(i.toLowerCase()){case"empty":return Fp();case"sun-earth-moon":case"earth":return Op();case"solar-system":case"full":return Bp();case"alpha-centauri":case"binary":return zp();case"psr-b1620":case"pulsar":return Hp();case"black-hole":case"blackhole":return Gp();default:return null}}class kp{constructor(){L(this,"name","Velocity Verlet");L(this,"order",2);L(this,"isSymplectic",!0);L(this,"prevAccelerations",new Map)}step(t,e,n,s){let r=this.prevAccelerations.get(t.id);r||(r=s(t,t.position,t.velocity,n));const o=U.multiplyScalar(r,e/2);t.velocity.add(o);const a=U.multiplyScalar(t.velocity,e);t.position.add(a);const l=s(t,t.position,t.velocity,n+e),c=U.multiplyScalar(l,e/2);t.velocity.add(c),this.prevAccelerations.set(t.id,l),t.acceleration.copy(l)}clearCache(){this.prevAccelerations.clear()}}class Wp{constructor(){L(this,"name","Runge-Kutta 4");L(this,"order",4);L(this,"isSymplectic",!1)}step(t,e,n,s){const r=t.position.clone(),o=t.velocity.clone(),a=s(t,r,o,n),l=o.clone(),c=U.add(r,U.multiplyScalar(l,e/2)),h=U.add(o,U.multiplyScalar(a,e/2)),d=s(t,c,h,n+e/2),p=U.add(r,U.multiplyScalar(h,e/2)),m=U.add(o,U.multiplyScalar(d,e/2)),_=s(t,p,m,n+e/2),g=U.add(r,U.multiplyScalar(m,e)),f=U.add(o,U.multiplyScalar(_,e)),u=s(t,g,f,n+e);t.position.copy(r).add(U.multiplyScalar(l,e/6)).add(U.multiplyScalar(h,e/3)).add(U.multiplyScalar(m,e/3)).add(U.multiplyScalar(f,e/6)),t.velocity.copy(o).add(U.multiplyScalar(a,e/6)).add(U.multiplyScalar(d,e/3)).add(U.multiplyScalar(_,e/3)).add(U.multiplyScalar(u,e/6)),t.acceleration.copy(u)}}const Je=class Je{constructor(t=1e-10,e=1e-6,n=3600){L(this,"name","Adaptive RK45 (Dormand-Prince)");L(this,"order",5);L(this,"isSymplectic",!1);L(this,"tolerance");L(this,"minDt");L(this,"maxDt");this.tolerance=t,this.minDt=e,this.maxDt=n}step(t,e,n,s){let r=Math.min(e,this.maxDt),o=e,a=n;for(;o>1e-12;){r=Math.min(r,o);const l=this.adaptiveStep(t,r,a,s);l.accepted&&(o-=r,a+=r),r=Math.max(this.minDt,Math.min(this.maxDt,l.suggestedDt))}}adaptiveStep(t,e,n,s){const r=t.position.clone(),o=t.velocity.clone(),a=[],l=[];for(let C=0;C<7;C++){const b=r.clone(),w=o.clone(),$=Je.a[C];for(let V=0;V<C;V++){const W=$[V]??0,nt=l[V],P=a[V];W!==0&&nt&&P&&(b.add(U.multiplyScalar(nt,e*W)),w.add(U.multiplyScalar(P,e*W)))}const M=Je.c[C]??0,E=s(t,b,w,n+M*e);a.push(E),l.push(w)}const c=r.clone(),h=o.clone();for(let C=0;C<7;C++){const b=Je.b5[C]??0,w=l[C],$=a[C];b!==0&&w&&$&&(c.add(U.multiplyScalar(w,e*b)),h.add(U.multiplyScalar($,e*b)))}const d=r.clone(),p=o.clone();for(let C=0;C<7;C++){const b=Je.b4[C]??0,w=l[C],$=a[C];b!==0&&w&&$&&(d.add(U.multiplyScalar(w,e*b)),p.add(U.multiplyScalar($,e*b)))}const m=c.distanceTo(d),_=h.distanceTo(p),g=Math.max(m,_),f=.9,u=.2,T=5;let y;g<1e-15?y=T:y=f*Math.pow(this.tolerance/g,.2),y=Math.max(u,Math.min(T,y));const A=e*y;return g<=this.tolerance||e<=this.minDt?(t.position.copy(c),t.velocity.copy(h),t.acceleration.copy(a[6]??U.zero()),{accepted:!0,suggestedDt:A}):{accepted:!1,suggestedDt:A}}};L(Je,"c",[0,1/5,3/10,4/5,8/9,1,1]),L(Je,"a",[[],[1/5],[3/40,9/40],[44/45,-56/15,32/9],[19372/6561,-25360/2187,64448/6561,-212/729],[9017/3168,-355/33,46732/5247,49/176,-5103/18656],[35/384,0,500/1113,125/192,-2187/6784,11/84]]),L(Je,"b5",[35/384,0,500/1113,125/192,-2187/6784,11/84,0]),L(Je,"b4",[5179/57600,0,7571/16695,393/640,-92097/339200,187/2100,1/40]);let Er=Je;const li=class li{constructor(t=1e-12,e=1e-9){L(this,"name","Gauss-Radau (IAS15)");L(this,"order",15);L(this,"isSymplectic",!1);L(this,"_tolerance");L(this,"_minDt");this._tolerance=t,this._minDt=e}get tolerance(){return this._tolerance}get minDt(){return this._minDt}step(t,e,n,s){const r=t.position.clone(),o=t.velocity.clone(),a=s(t,r,o,n);let l=r.clone(),c=o.clone(),h=a.clone();for(let d=1;d<li.h.length;d++){const p=li.h[d],m=li.h[d-1],_=(p-m)*e,g=U.add(l,U.multiplyScalar(c,_)),f=U.add(c,U.multiplyScalar(h,_)),u=s(t,g,f,n+p*e);l.add(U.multiplyScalar(U.add(c,f),_/2)),c.add(U.multiplyScalar(U.add(h,u),_/2)),h=u}t.position.copy(l),t.velocity.copy(c),t.acceleration.copy(h)}};L(li,"h",[0,.05626256053692215,.18024069173689236,.3526247171131696,.5471536263305554,.7342101772154105,.8853209468390958,.9775206135612875]);let Tr=li;function ds(i){switch(i.toLowerCase()){case"verlet":case"velocity-verlet":case"leapfrog":return new kp;case"rk4":case"runge-kutta":return new Wp;case"rk45":case"adaptive":case"dormand-prince":return new Er;case"ias15":case"gauss-radau":case"radau":return new Tr;default:throw new Error(`Unknown integrator: ${i}`)}}class Dr{constructor(t,e){L(this,"center");L(this,"halfSize");L(this,"totalMass",0);L(this,"centerOfMass",U.zero());L(this,"softening",0);L(this,"children",null);L(this,"body",null);L(this,"bodyCount",0);this.center=t,this.halfSize=e}get isLeaf(){return this.children===null}get isEmpty(){return this.bodyCount===0}get isExternal(){return this.isLeaf&&this.body!==null}getOctant(t){let e=0;return t.x>=this.center.x&&(e|=1),t.y>=this.center.y&&(e|=2),t.z>=this.center.z&&(e|=4),e}getChildCenter(t){const e=this.halfSize/2;return new U(this.center.x+(t&1?e:-e),this.center.y+(t&2?e:-e),this.center.z+(t&4?e:-e))}createChildren(){this.children=new Array(8).fill(null)}getOrCreateChild(t){this.children||this.createChildren();let e=this.children[t];return e||(e=new Dr(this.getChildCenter(t),this.halfSize/2),this.children[t]=e),e}insert(t){if(this.isEmpty){this.body=t,this.bodyCount=1,this.totalMass=t.mass,this.centerOfMass=t.position.clone(),this.softening=t.softening;return}if(this.isExternal){const n=this.body;this.body=null;const s=this.getOctant(n.position);this.getOrCreateChild(s).insert(n)}const e=this.getOctant(t.position);this.getOrCreateChild(e).insert(t),this.updateMassProperties(t)}updateMassProperties(t){const e=this.totalMass,n=e+t.mass;n>0&&(this.centerOfMass=new U((this.centerOfMass.x*e+t.position.x*t.mass)/n,(this.centerOfMass.y*e+t.position.y*t.mass)/n,(this.centerOfMass.z*e+t.position.z*t.mass)/n)),this.totalMass=n,this.bodyCount++,this.softening=Math.max(this.softening,t.softening)}calculateAcceleration(t,e){if(this.isEmpty||this.isExternal&&this.body===t)return U.zero();const n=U.sub(this.centerOfMass,t.position),s=n.lengthSquared(),r=Math.sqrt(s),a=this.halfSize*2/r;if(this.isExternal||a<e){if(r<1e-10)throw new Error(`Barnes-Hut: Body ${t.id} is at same position as node center of mass (singularity)`);const l=s+this.softening*this.softening,c=gi*this.totalMass/l;return n.multiplyScalar(c/r)}else{const l=U.zero();if(this.children)for(const c of this.children)c&&!c.isEmpty&&l.add(c.calculateAcceleration(t,e));return l}}findBodiesWithin(t,e,n=[]){if(this.isEmpty||t.distanceTo(this.center)-this.halfSize*Math.sqrt(3)>e)return n;if(this.isExternal&&this.body)return t.distanceTo(this.body.position)<=e&&n.push(this.body),n;if(this.children)for(const r of this.children)r&&r.findBodiesWithin(t,e,n);return n}clear(){this.totalMass=0,this.centerOfMass=U.zero(),this.softening=0,this.children=null,this.body=null,this.bodyCount=0}getStats(){let t=1,e=0,n=0;const s=(r,o)=>{if(n=Math.max(n,o),r.isLeaf){e++;return}if(r.children)for(const a of r.children)a&&(t++,s(a,o+1))};return s(this,0),{nodes:t,leaves:e,maxDepth:n}}}class Xp{constructor(t=Pp){L(this,"root",null);L(this,"theta");this.theta=t}setTheta(t){if(t<0)throw new Error(`BarnesHutTree: theta must be non-negative, got ${t}`);this.theta=t}build(t){if(t.length===0){this.root=null;return}const e=this.calculateBounds(t),n=new U((e.min.x+e.max.x)/2,(e.min.y+e.max.y)/2,(e.min.z+e.max.z)/2),r=Math.max(e.max.x-e.min.x,e.max.y-e.min.y,e.max.z-e.min.z)*.6;this.root=new Dr(n,r);for(const o of t)this.root.insert(o)}calculateAcceleration(t){return this.root?this.root.calculateAcceleration(t,this.theta):U.zero()}calculateBounds(t){if(t.length===0)return{min:U.zero(),max:U.zero()};const e=t[0],n=e.position.clone(),s=e.position.clone();for(let r=1;r<t.length;r++){const o=t[r].position;n.x=Math.min(n.x,o.x),n.y=Math.min(n.y,o.y),n.z=Math.min(n.z,o.z),s.x=Math.max(s.x,o.x),s.y=Math.max(s.y,o.y),s.z=Math.max(s.z,o.z)}return{min:n,max:s}}findBodiesWithin(t,e){return this.root?this.root.findBodiesWithin(t,e):[]}clear(){this.root&&this.root.clear(),this.root=null}getStats(){var t;return((t=this.root)==null?void 0:t.getStats())??null}}var yn;(function(i){i.DIRECT="direct",i.BARNES_HUT="barnes_hut",i.FMM="fmm"})(yn||(yn={}));const qp={timestep:sl,gravityMethod:yn.BARNES_HUT,barnesHutTheta:.5,defaultIntegrator:"verlet",closeEncounterIntegrator:"rk45",timeScale:1,maxSubsteps:Dp,enableCollisions:!0,enableSOI:!0};class Yp{constructor(t={}){L(this,"config");L(this,"bodies",new Map);L(this,"massiveBodies",[]);L(this,"passiveBodies",[]);L(this,"barnesHutTree");L(this,"defaultIntegrator");L(this,"closeEncounterIntegrator");L(this,"simulationTime",0);L(this,"tickCount",0);L(this,"accumulator",0);L(this,"bodySOI",new Map);L(this,"callbacks",{});this.config={...qp,...t},this.barnesHutTree=new Xp(this.config.barnesHutTheta),this.defaultIntegrator=ds(this.config.defaultIntegrator),this.closeEncounterIntegrator=ds(this.config.closeEncounterIntegrator)}setConfig(t){this.config={...this.config,...t},t.barnesHutTheta!==void 0&&this.barnesHutTree.setTheta(t.barnesHutTheta),t.defaultIntegrator!==void 0&&(this.defaultIntegrator=ds(t.defaultIntegrator)),t.closeEncounterIntegrator!==void 0&&(this.closeEncounterIntegrator=ds(t.closeEncounterIntegrator))}setCallbacks(t){this.callbacks={...this.callbacks,...t}}loadWorld(t){this.clear();for(const e of t.bodies)this.addBody(e)}addBody(t){const e=new ui(t);if(this.bodies.has(e.id))throw new Error(`PhysicsEngine: Body with id '${e.id}' already exists`);return this.bodies.set(e.id,e),this.categorizeBody(e),e}removeBody(t){return this.bodies.get(t)?(this.bodies.delete(t),this.massiveBodies=this.massiveBodies.filter(n=>n.id!==t),this.passiveBodies=this.passiveBodies.filter(n=>n.id!==t),this.bodySOI.delete(t),!0):!1}getBody(t){return this.bodies.get(t)}getAllBodies(){return Array.from(this.bodies.values())}getMassiveBodies(){return[...this.massiveBodies]}clear(){this.bodies.clear(),this.massiveBodies=[],this.passiveBodies=[],this.bodySOI.clear(),this.barnesHutTree.clear(),this.simulationTime=0,this.tickCount=0,this.accumulator=0}categorizeBody(t){t.type===xe.MASSIVE?this.massiveBodies.push(t):this.passiveBodies.push(t)}update(t){const e=t*this.config.timeScale;this.accumulator+=e;const n=this.config.timestep;let s=0;for(;this.accumulator>=n&&s<this.config.maxSubsteps;)this.step(n),this.accumulator-=n,s++;this.accumulator>n*10&&(console.warn(`PhysicsEngine: Accumulator overflow, discarding ${this.accumulator.toFixed(3)}s`),this.accumulator=0)}step(t){this.config.gravityMethod===yn.BARNES_HUT&&this.barnesHutTree.build(this.massiveBodies);const e=(n,s,r,o)=>this.calculateAcceleration(n,s);for(const n of this.massiveBodies)this.selectIntegrator(n).step(n,t,this.simulationTime,e),n.updateRotation(t);for(const n of this.passiveBodies)this.selectIntegrator(n).step(n,t,this.simulationTime,e),n.updateRotation(t);this.config.enableCollisions&&this.checkCollisions(),this.config.enableSOI&&this.updateSOITracking(),this.simulationTime+=t,this.tickCount++,this.callbacks.onTick&&this.callbacks.onTick(this.getState())}calculateAcceleration(t,e){switch(this.config.gravityMethod){case yn.DIRECT:return this.calculateAccelerationDirect(t,e);case yn.BARNES_HUT:return this.calculateAccelerationBarnesHut(t,e);case yn.FMM:throw new Error("PhysicsEngine: FMM not yet implemented");default:throw new Error(`PhysicsEngine: Unknown gravity method ${this.config.gravityMethod}`)}}calculateAccelerationDirect(t,e){const n=U.zero();for(const s of this.massiveBodies){if(s===t)continue;const r=U.sub(s.position,e),o=r.lengthSquared(),a=Math.sqrt(o);if(a<1e-10)throw new Error(`PhysicsEngine: Singularity detected - bodies ${t.id} and ${s.id} at same position`);const l=o+s.softening*s.softening,c=gi*s.mass/l;n.add(r.multiplyScalar(c/a))}return n}calculateAccelerationBarnesHut(t,e){return this.barnesHutTree.calculateAcceleration(t)}selectIntegrator(t){if(!this.config.enableSOI)return this.defaultIntegrator;for(const e of this.massiveBodies){if(e===t)continue;const n=t.position.distanceTo(e.position),s=e.radius*Lp;if(n<s)return this.closeEncounterIntegrator}return this.defaultIntegrator}checkCollisions(){var e,n;const t=[...this.massiveBodies,...this.passiveBodies];for(let s=0;s<t.length;s++){const r=t[s];for(let o=s+1;o<t.length;o++){const a=t[o],l=r.position.distanceTo(a.position),c=r.radius+a.radius;if(l<c){const h=U.sub(a.position,r.position).safeNormalize(),d=U.add(r.position,U.multiplyScalar(h,r.radius)),p=U.sub(a.velocity,r.velocity),m={bodyA:r,bodyB:a,point:d,relativeVelocity:p,timestamp:this.simulationTime};(n=(e=this.callbacks).onCollision)==null||n.call(e,m)}}}}updateSOITracking(){var t,e;for(const n of this.passiveBodies){const s=this.bodySOI.get(n.id)??null,r=this.findDominantBody(n);if(r!==s){const o={body:n,from:s?this.bodies.get(s)??null:null,to:r?this.bodies.get(r)??null:null,timestamp:this.simulationTime};this.bodySOI.set(n.id,r),(e=(t=this.callbacks).onSOITransition)==null||e.call(t,o)}}}findDominantBody(t){let e=null,n=0;for(const s of this.massiveBodies){const r=t.position.distanceTo(s.position);if(r<s.soiRadius){const o=s.mass/(r*r);o>n&&(n=o,e=s)}}return(e==null?void 0:e.id)??null}calculateTotalEnergy(){let t=0,e=0;const n=[...this.massiveBodies,...this.passiveBodies];for(const s of n){const r=s.velocity.lengthSquared();t+=.5*s.mass*r}for(let s=0;s<this.massiveBodies.length;s++){const r=this.massiveBodies[s];for(let o=s+1;o<this.massiveBodies.length;o++){const a=this.massiveBodies[o],l=r.position.distanceTo(a.position);l>0&&(e-=gi*r.mass*a.mass/l)}}return{kinetic:t,potential:e,total:t+e}}calculateAngularMomentum(){const t=U.zero();for(const e of this.getAllBodies()){const n=U.multiplyScalar(e.velocity,e.mass),s=U.cross(e.position,n);t.add(s)}return t}calculateCenterOfMass(){let t=0;const e=U.zero();for(const n of this.getAllBodies())e.add(U.multiplyScalar(n.position,n.mass)),t+=n.mass;return t>0&&e.divideScalar(t),e}getState(){const t=this.calculateTotalEnergy();return{time:this.simulationTime,tick:this.tickCount,bodyCount:this.bodies.size,massiveBodies:this.massiveBodies.length,passiveBodies:this.passiveBodies.length,totalEnergy:t.total,kineticEnergy:t.kinetic,potentialEnergy:t.potential}}getTime(){return this.simulationTime}getTick(){return this.tickCount}setTimeScale(t){if(t<0)throw new Error(`PhysicsEngine: Time scale must be non-negative, got ${t}`);this.config.timeScale=t}getTimeScale(){return this.config.timeScale}exportWorld(t,e=""){return{name:t,description:e,seed:0,bodies:this.getAllBodies().map(n=>n.toDefinition()),metadata:{exportTime:this.simulationTime,exportTick:this.tickCount}}}getConfig(){return{...this.config}}}function $p(i){return new Yp(i)}var pe;(function(i){i.CONNECT="connect",i.DISCONNECT="disconnect",i.PING="ping",i.PONG="pong",i.JOIN="join",i.JOINED="joined",i.PLAYER_JOINED="player_joined",i.PLAYER_LEFT="player_left",i.WORLD_STATE="world_state",i.WORLD_DELTA="world_delta",i.BODY_UPDATE="body_update",i.BODY_ADD="body_add",i.BODY_REMOVE="body_remove",i.PLAYER_INPUT="player_input",i.PLAYER_STATE="player_state",i.CHAT_MESSAGE="chat_message",i.SYSTEM_MESSAGE="system_message",i.WORLD_BUILDER_ACTION="world_builder_action",i.CONFIG_UPDATE="config_update",i.CONFIG_REQUEST="config_request",i.TIME_SCALE="time_scale",i.PAUSE="pause",i.RESUME="resume",i.ERROR="error"})(pe||(pe={}));var mo;(function(i){i.SELECT="select",i.DESELECT="deselect",i.CREATE="create",i.DELETE="delete",i.MODIFY="modify",i.MOVE="move",i.COPY="copy",i.FOLLOW="follow",i.TELEPORT="teleport"})(mo||(mo={}));function jp(i,t){const e=new DataView(i),n=e.getUint32(0,!0),s=e.getUint32(4,!0),r=[];let o=8;for(let a=0;a<s;a++){const l=e.getUint32(o,!0),c=t.get(l)??`unknown_${l}`;o+=4;const h=[e.getFloat64(o,!0),e.getFloat64(o+8,!0),e.getFloat64(o+16,!0)];o+=24;const d=[e.getFloat64(o,!0),e.getFloat64(o+8,!0),e.getFloat64(o+16,!0)];o+=24;const p=[e.getFloat32(o,!0),e.getFloat32(o+4,!0),e.getFloat32(o+8,!0),e.getFloat32(o+12,!0)];o+=16;const m=e.getFloat32(o,!0);o+=4,r.push({id:c,p:h,v:d,o:p,av:m,t:Date.now()})}return{tick:n,states:r}}function Kp(i){let t=0;for(let e=0;e<i.length;e++){const n=i.charCodeAt(e);t=(t<<5)-t+n>>>0}return t}function Zp(i){const t=new Map;for(const e of i)t.set(Kp(e),e);return t}var de;(function(i){i.SURFACE="surface",i.SPACE="space",i.WORLD_BUILDER="world_builder"})(de||(de={}));const Jp={walkSpeed:5,sprintMultiplier:2,jumpVelocity:4,evaThrust:10,evaRotationSpeed:1,cameraSensitivity:.002};class Qp{constructor(t,e,n=U.zero(),s={}){L(this,"id");L(this,"name");L(this,"position");L(this,"velocity");L(this,"orientation");L(this,"mode");L(this,"currentBody",null);L(this,"isGrounded",!1);L(this,"groundNormal",U.unitY());L(this,"movementConfig");L(this,"currentInput");L(this,"inputBuffer",[]);L(this,"lastProcessedInput",0);L(this,"health",100);L(this,"isAlive",!0);this.id=t,this.name=e,this.position=n,this.velocity=U.zero(),this.orientation=$t.identity(),this.mode=de.SURFACE,this.movementConfig={...Jp,...s},this.currentInput=this.createEmptyInput()}createEmptyInput(){return{forward:!1,backward:!1,left:!1,right:!1,up:!1,down:!1,jump:!1,sprint:!1,pitchUp:!1,pitchDown:!1,yawLeft:!1,yawRight:!1,rollLeft:!1,rollRight:!1,thrustX:0,thrustY:0,thrustZ:0,primaryAction:!1,secondaryAction:!1,cameraYaw:0,cameraYitch:0,sequence:0}}applyInput(t,e){switch(this.currentInput=t,this.mode){case de.SURFACE:this.applySurfaceMovement(t,e);break;case de.SPACE:this.applySpaceMovement(t,e);break;case de.WORLD_BUILDER:break}}applySurfaceMovement(t,e){const n=this.movementConfig;let s=n.walkSpeed;t.sprint&&(s*=n.sprintMultiplier);const r=this.groundNormal.clone(),o=this.orientation.rotateVector(U.unitZ()).negate(),a=U.cross(r,o).safeNormalize();o.copy(U.cross(a,r).safeNormalize());const l=U.zero();if(t.forward&&l.add(o),t.backward&&l.sub(o),t.right&&l.add(a),t.left&&l.sub(a),l.isZero()){if(this.isGrounded){const c=U.sub(this.velocity,U.multiplyScalar(r,this.velocity.dot(r))),h=Math.min(1,e*8);this.velocity.sub(U.multiplyScalar(c,h))}}else{l.safeNormalize().multiplyScalar(s);const c=U.sub(this.velocity,U.multiplyScalar(r,this.velocity.dot(r))),h=l,d=Math.min(1,e*10);this.velocity.sub(c).add(U.lerp(c,h,d))}t.jump&&this.isGrounded&&(this.velocity.add(U.multiplyScalar(r,n.jumpVelocity)),this.isGrounded=!1)}applySpaceMovement(t,e){const n=this.movementConfig,s=n.evaThrust,r=this.orientation.rotateVector(U.unitZ()).negate(),o=this.orientation.rotateVector(U.unitX()),a=this.orientation.rotateVector(U.unitY()),l=U.zero();t.forward&&l.add(r),t.backward&&l.sub(r),t.right&&l.add(o),t.left&&l.sub(o),t.up&&l.add(a),t.down&&l.sub(a),l.x+=t.thrustX,l.y+=t.thrustY,l.z+=t.thrustZ,l.isZero()||(l.safeNormalize().multiplyScalar(s*e),this.velocity.add(l));const c=n.evaRotationSpeed*e;if(t.pitchUp){const h=new $t().setFromAxisAngle(o,c);this.orientation.premultiply(h).normalize()}if(t.pitchDown){const h=new $t().setFromAxisAngle(o,-c);this.orientation.premultiply(h).normalize()}if(t.yawLeft){const h=new $t().setFromAxisAngle(a,c);this.orientation.premultiply(h).normalize()}if(t.yawRight){const h=new $t().setFromAxisAngle(a,-c);this.orientation.premultiply(h).normalize()}if(t.rollLeft){const h=new $t().setFromAxisAngle(r,c);this.orientation.premultiply(h).normalize()}if(t.rollRight){const h=new $t().setFromAxisAngle(r,-c);this.orientation.premultiply(h).normalize()}}updatePhysics(t,e){this.mode!==de.WORLD_BUILDER&&(this.velocity.add(U.multiplyScalar(e,t)),this.position.add(U.multiplyScalar(this.velocity,t)))}checkCollision(t){const e=U.sub(this.position,t.position),n=e.length(),s=1;if(n<t.radius+s){const r=e.clone().divideScalar(n),o=t.radius+s-n;this.position.add(U.multiplyScalar(r,o)),this.isGrounded=!0,this.groundNormal=r,this.currentBody=t;const a=this.velocity.dot(r);return a<0&&this.velocity.sub(U.multiplyScalar(r,a)),!0}return!1}spawnOnBody(t,e=0,n=0){const s=Math.cos(e),r=Math.sin(e),o=Math.cos(n),a=Math.sin(n),l=new U(s*o,r,s*a),c=2;this.position=U.add(t.position,U.multiplyScalar(l,t.radius+c)),this.velocity=t.velocity.clone();const h=t.getSurfaceVelocity(this.position);this.velocity.add(h),this.orientation=$t.fromVectors(U.unitY(),l),this.currentBody=t,this.isGrounded=!0,this.groundNormal=l,this.mode=de.SURFACE}enterSpaceMode(){this.mode=de.SPACE,this.isGrounded=!1,this.currentBody=null}enterWorldBuilderMode(){this.mode=de.WORLD_BUILDER}exitWorldBuilderMode(){this.currentBody?this.mode=de.SURFACE:this.mode=de.SPACE}bufferInput(t,e){for(this.inputBuffer.push({input:t,timestamp:Date.now(),deltaTime:e});this.inputBuffer.length>60;)this.inputBuffer.shift()}reconcile(t){this.position.set(t.position[0],t.position[1],t.position[2]),this.velocity.set(t.velocity[0],t.velocity[1],t.velocity[2]),this.orientation.set(t.orientation[0],t.orientation[1],t.orientation[2],t.orientation[3]),this.health=t.health;const e=this.inputBuffer.filter(n=>n.input.sequence>t.lastProcessedInput);for(const n of e)this.applyInput(n.input,n.deltaTime);this.inputBuffer=e,this.lastProcessedInput=t.lastProcessedInput}toNetworkState(){var t;return{playerId:this.id,position:this.position.toArray(),velocity:this.velocity.toArray(),orientation:this.orientation.toArray(),currentBodyId:((t=this.currentBody)==null?void 0:t.id)??null,mode:this.mode===de.WORLD_BUILDER?"world_builder":this.mode===de.SPACE?"space":"surface",health:this.health,lastProcessedInput:this.lastProcessedInput}}applyNetworkState(t){this.position.set(t.position[0],t.position[1],t.position[2]),this.velocity.set(t.velocity[0],t.velocity[1],t.velocity[2]),this.orientation.set(t.orientation[0],t.orientation[1],t.orientation[2],t.orientation[3]),this.health=t.health,this.mode=t.mode==="world_builder"?de.WORLD_BUILDER:t.mode==="space"?de.SPACE:de.SURFACE}getForward(){return this.orientation.rotateVector(U.unitZ()).negate()}getRight(){return this.orientation.rotateVector(U.unitX())}getUp(){return this.orientation.rotateVector(U.unitY())}}class tm{constructor(t=75,e=1,n=.1,s=1e16){L(this,"camera");L(this,"worldPosition");L(this,"originOffset");L(this,"yaw",0);L(this,"pitch",0);L(this,"logDepthC");this.camera=new Ne(t,e,n,s),this.camera.position.set(0,0,0),this.logDepthC=2/Math.log2(s+1),this.worldPosition=new U(0,0,0),this.originOffset=new U(0,0,0)}setWorldPosition(t,e,n){this.worldPosition.set(t,e,n),this.checkRecenter()}getWorldPosition(){return this.worldPosition.clone()}getOriginOffset(){return this.originOffset.clone()}worldToRender(t){return new D(t.x-this.originOffset.x,t.y-this.originOffset.y,t.z-this.originOffset.z)}renderToWorld(t){return new U(t.x+this.originOffset.x,t.y+this.originOffset.y,t.z+this.originOffset.z)}checkRecenter(){const t=this.worldPosition.x-this.originOffset.x,e=this.worldPosition.y-this.originOffset.y,n=this.worldPosition.z-this.originOffset.z;t*t+e*e+n*n>fo*fo&&this.recenter()}recenter(){const t=new U(this.worldPosition.x-this.originOffset.x,this.worldPosition.y-this.originOffset.y,this.worldPosition.z-this.originOffset.z);return this.originOffset.copy(this.worldPosition),t}setOrientation(t,e){this.yaw=t,this.pitch=Math.max(-Math.PI/2+.01,Math.min(Math.PI/2-.01,e));const n=new xi;n.setFromEuler(new Oi(this.pitch,this.yaw,0,"YXZ")),this.camera.quaternion.copy(n)}rotate(t,e){this.setOrientation(this.yaw+t,this.pitch+e)}getForward(){const t=new D(0,0,-1);return t.applyQuaternion(this.camera.quaternion),t}getRight(){const t=new D(1,0,0);return t.applyQuaternion(this.camera.quaternion),t}getUp(){const t=new D(0,1,0);return t.applyQuaternion(this.camera.quaternion),t}setAspect(t){this.camera.aspect=t,this.camera.updateProjectionMatrix()}setFOV(t){this.camera.fov=t,this.camera.updateProjectionMatrix()}getLogDepthC(){return this.logDepthC}}const em=`
varying vec3 vWorldPosition;
varying vec3 vNormal;

void main() {
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPos.xyz;
  vNormal = normalize(normalMatrix * normal);
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,nm=`
precision highp float;

uniform vec3 cameraPosition;
uniform vec3 sunDirection;
uniform vec3 rayleighCoefficient;
uniform float mieCoefficient;
uniform float scaleHeight;
uniform float planetRadius;
uniform float atmosphereRadius;
uniform float sunIntensity;
uniform float g;

varying vec3 vWorldPosition;
varying vec3 vNormal;

const float PI = 3.14159265359;
const int NUM_SAMPLES = 16;
const int NUM_SAMPLES_LIGHT = 8;

// Rayleigh phase function
float rayleighPhase(float cosTheta) {
  return (3.0 / (16.0 * PI)) * (1.0 + cosTheta * cosTheta);
}

// Mie phase function (Henyey-Greenstein approximation)
float miePhase(float cosTheta, float g) {
  float g2 = g * g;
  float num = 3.0 * (1.0 - g2) * (1.0 + cosTheta * cosTheta);
  float denom = 8.0 * PI * (2.0 + g2) * pow(1.0 + g2 - 2.0 * g * cosTheta, 1.5);
  return num / denom;
}

// Density falloff with altitude
float densityAtHeight(float h) {
  return exp(-h / scaleHeight);
}

// Ray-sphere intersection
// Returns distance to intersection, or -1 if no intersection
vec2 raySphereIntersect(vec3 origin, vec3 dir, float radius) {
  float b = dot(origin, dir);
  float c = dot(origin, origin) - radius * radius;
  float d = b * b - c;
  
  if (d < 0.0) return vec2(-1.0);
  
  float sd = sqrt(d);
  return vec2(-b - sd, -b + sd);
}

void main() {
  vec3 rayOrigin = cameraPosition;
  vec3 rayDir = normalize(vWorldPosition - cameraPosition);
  
  // Find atmosphere intersection
  vec2 atmIntersect = raySphereIntersect(rayOrigin, rayDir, atmosphereRadius);
  
  if (atmIntersect.y < 0.0) {
    discard;
  }
  
  // Check for planet intersection
  vec2 planetIntersect = raySphereIntersect(rayOrigin, rayDir, planetRadius);
  
  float tStart = max(atmIntersect.x, 0.0);
  float tEnd = (planetIntersect.x > 0.0) ? planetIntersect.x : atmIntersect.y;
  
  if (tStart >= tEnd) {
    discard;
  }
  
  // Calculate scattering
  float segmentLength = (tEnd - tStart) / float(NUM_SAMPLES);
  vec3 rayleighSum = vec3(0.0);
  vec3 mieSum = vec3(0.0);
  float opticalDepthR = 0.0;
  float opticalDepthM = 0.0;
  
  for (int i = 0; i < NUM_SAMPLES; i++) {
    float t = tStart + (float(i) + 0.5) * segmentLength;
    vec3 samplePoint = rayOrigin + rayDir * t;
    float height = length(samplePoint) - planetRadius;
    
    // Density at sample point
    float densityR = densityAtHeight(height);
    float densityM = densityR; // Same scale height for simplicity
    
    opticalDepthR += densityR * segmentLength;
    opticalDepthM += densityM * segmentLength;
    
    // Light ray to sun
    vec2 lightIntersect = raySphereIntersect(samplePoint, sunDirection, atmosphereRadius);
    
    if (lightIntersect.y > 0.0) {
      float lightSegment = lightIntersect.y / float(NUM_SAMPLES_LIGHT);
      float lightOpticalDepthR = 0.0;
      float lightOpticalDepthM = 0.0;
      
      for (int j = 0; j < NUM_SAMPLES_LIGHT; j++) {
        float lt = (float(j) + 0.5) * lightSegment;
        vec3 lightSample = samplePoint + sunDirection * lt;
        float lightHeight = length(lightSample) - planetRadius;
        
        if (lightHeight < 0.0) break;
        
        float lightDensity = densityAtHeight(lightHeight);
        lightOpticalDepthR += lightDensity * lightSegment;
        lightOpticalDepthM += lightDensity * lightSegment;
      }
      
      // Transmittance to sun
      vec3 tau = rayleighCoefficient * (opticalDepthR + lightOpticalDepthR) +
                 mieCoefficient * (opticalDepthM + lightOpticalDepthM);
      vec3 transmittance = exp(-tau);
      
      rayleighSum += densityR * transmittance * segmentLength;
      mieSum += densityM * transmittance * segmentLength;
    }
  }
  
  // Phase functions
  float cosTheta = dot(rayDir, sunDirection);
  float phaseR = rayleighPhase(cosTheta);
  float phaseM = miePhase(cosTheta, g);
  
  // Final color
  vec3 rayleighColor = rayleighCoefficient * phaseR * rayleighSum;
  vec3 mieColor = vec3(mieCoefficient) * phaseM * mieSum;
  vec3 color = sunIntensity * (rayleighColor + mieColor);
  
  // Transmittance for alpha
  vec3 tau = rayleighCoefficient * opticalDepthR + mieCoefficient * opticalDepthM;
  float alpha = 1.0 - exp(-length(tau) * 0.5);
  
  gl_FragColor = vec4(color, alpha);
}
`;class im{static createMaterial(t){return new fn({vertexShader:em,fragmentShader:nm,uniforms:{cameraPosition:{value:new D(0,0,0)},sunDirection:{value:new D(1,0,0)},rayleighCoefficient:{value:new D(t.rayleighCoefficient[0],t.rayleighCoefficient[1],t.rayleighCoefficient[2])},mieCoefficient:{value:t.mieCoefficient},scaleHeight:{value:t.scaleHeight},planetRadius:{value:t.planetRadius},atmosphereRadius:{value:t.atmosphereRadius},sunIntensity:{value:t.sunIntensity},g:{value:t.g}},transparent:!0,depthWrite:!1,side:be,blending:ps})}static getEarthParams(){return{rayleighCoefficient:[55e-7,13e-6,224e-7],mieCoefficient:21e-6,scaleHeight:8500,planetRadius:6371e3,atmosphereRadius:6471e3,sunIntensity:22,g:.76}}static getMarsParams(){return{rayleighCoefficient:[19918e-9,1357e-8,575e-8],mieCoefficient:5e-5,scaleHeight:11100,planetRadius:3389500,atmosphereRadius:3489500,sunIntensity:10,g:.7}}}const Ci=[{minAngle:.1,segments:128},{minAngle:.01,segments:64},{minAngle:.001,segments:32},{minAngle:1e-4,segments:16},{minAngle:0,segments:8}];class sm{constructor(t,e){L(this,"scene");L(this,"bodies",new Map);L(this,"camera");L(this,"geometryCache",new Map);L(this,"starLights",new Map);L(this,"ambientLight");this.scene=t,this.camera=e,this.ambientLight=new wp(1118498,.3),this.scene.add(this.ambientLight);for(const n of Ci)this.geometryCache.set(n.segments,new Ss(1,n.segments,n.segments/2))}calcAngularDiameter(t,e){return e<=t?Math.PI:2*Math.atan(t/e)}getLODLevel(t){for(let n=0;n<Ci.length;n++){const s=Ci[n];if(s&&t>=s.minAngle)return s.segments}const e=Ci[Ci.length-1];return e?e.segments:8}createMaterial(t){const e=s=>Math.floor(s[0]*255)<<16|Math.floor(s[1]*255)<<8|Math.floor(s[2]*255);if(t.bodyClass===Wt.STAR){const s=e(t.color);return new Li({color:s})}if(t.bodyClass===Wt.BLACK_HOLE)return new Li({color:0,transparent:!0,opacity:1});const n=e(t.color);return new Ep({color:n,roughness:.8,metalness:.2})}addBody(t){var o;if(this.bodies.has(t.id)){console.warn(`Body ${t.id} already exists in renderer`);return}const e=this.geometryCache.get(32),n=this.createMaterial(t),s=new $e(e,n);s.name=t.id,this.scene.add(s);const r={mesh:s,currentLOD:32,body:t};if(t.atmosphere){const a=this.createAtmosphereMesh(t);this.scene.add(a),r.atmosphereMesh=a}if(t.bodyClass===Wt.STAR){const a=((o=t.starProperties)==null?void 0:o.luminosity)??1,l=Math.floor(t.color[0]*255)<<16|Math.floor(t.color[1]*255)<<8|Math.floor(t.color[2]*255),c=new bp(l||16777198,a*2,0,0);this.scene.add(c),this.starLights.set(t.id,c)}if(t.rings){const a=this.createRingMesh(t);this.scene.add(a),r.ringMesh=a}this.bodies.set(t.id,r)}createAtmosphereMesh(t){const e=t.atmosphere,n=1+e.scaleHeight/t.radius*10,s=new Ss(1,64,32),r=im.createMaterial({rayleighCoefficient:e.rayleighCoefficients||[55e-7,13e-6,224e-7],mieCoefficient:e.mieCoefficient||21e-6,scaleHeight:e.scaleHeight,planetRadius:t.radius,atmosphereRadius:t.radius*n,sunIntensity:22,g:e.mieDirectionality||.76}),o=new $e(s,r);return o.name=`${t.id}_atmosphere`,o.renderOrder=100,o}createRingMesh(t){const e=t.rings,n=new Lr(e.innerRadius/t.radius,e.outerRadius/t.radius,128),s=document.createElement("canvas");s.width=512,s.height=1;const r=s.getContext("2d"),o=r.createLinearGradient(0,0,512,0);o.addColorStop(0,"rgba(200, 180, 160, 0.3)"),o.addColorStop(.2,"rgba(220, 200, 180, 0.6)"),o.addColorStop(.3,"rgba(180, 160, 140, 0.2)"),o.addColorStop(.5,"rgba(200, 180, 160, 0.5)"),o.addColorStop(.7,"rgba(160, 140, 120, 0.3)"),o.addColorStop(.9,"rgba(200, 180, 160, 0.4)"),o.addColorStop(1,"rgba(180, 160, 140, 0.1)"),r.fillStyle=o,r.fillRect(0,0,512,1);const a=new yp(s);a.wrapS=He;const l=new Li({map:a,transparent:!0,side:tn,opacity:e.opacity||.8}),c=new $e(n,l);return c.name=`${t.id}_rings`,c.rotation.x=-Math.PI/2,c}removeBody(t){const e=this.bodies.get(t);if(!e)return;this.scene.remove(e.mesh),e.mesh.geometry.dispose(),e.mesh.material instanceof un&&e.mesh.material.dispose(),e.atmosphereMesh&&(this.scene.remove(e.atmosphereMesh),e.atmosphereMesh.geometry.dispose(),e.atmosphereMesh.material instanceof un&&e.atmosphereMesh.material.dispose()),e.ringMesh&&(this.scene.remove(e.ringMesh),e.ringMesh.geometry.dispose(),e.ringMesh.material instanceof un&&e.ringMesh.material.dispose());const n=this.starLights.get(t);n&&(this.scene.remove(n),n.dispose(),this.starLights.delete(t)),this.bodies.delete(t)}update(){const t=this.camera.getWorldPosition(),e=this.camera.getOriginOffset();for(const[n,s]of this.bodies)this.updateBody(s,t,e)}updateBody(t,e,n){var f,u,T,y;const s=t.body,r=s.position.x-n.x,o=s.position.y-n.y,a=s.position.z-n.z;t.mesh.position.set(r,o,a);const l=s.position.x-e.x,c=s.position.y-e.y,h=s.position.z-e.z,d=Math.sqrt(l*l+c*c+h*h),p=this.calcAngularDiameter(s.radius,d),m=this.getLODLevel(p);m!==t.currentLOD&&(t.mesh.geometry=this.geometryCache.get(m),t.currentLOD=m);const _=this.calculateRenderScale(s.radius,d);if(t.mesh.scale.setScalar(_),s.orientation&&t.mesh.quaternion.set(s.orientation.x,s.orientation.y,s.orientation.z,s.orientation.w),t.atmosphereMesh){t.atmosphereMesh.position.copy(t.mesh.position),t.atmosphereMesh.scale.setScalar(_*1.1);const C=t.atmosphereMesh.material;if(C.uniforms){(u=(f=C.uniforms.cameraPosition)==null?void 0:f.value)==null||u.set(0,0,0);const b=this.getNearestStarDirection(s.position);(y=(T=C.uniforms.sunDirection)==null?void 0:T.value)==null||y.copy(b)}}t.ringMesh&&(t.ringMesh.position.copy(t.mesh.position),t.ringMesh.scale.setScalar(_),s.orientation&&t.ringMesh.quaternion.copy(t.mesh.quaternion));const g=this.starLights.get(s.id);g&&g.position.copy(t.mesh.position)}calculateRenderScale(t,e){let r=t;if(r<.01&&e>0){const o=2*Math.atan(t/e);r=Math.max(e*Math.tan(o/2),.01)}return r>1e8&&(r=1e8),r}getNearestStarDirection(t){let e=1/0,n=new D(1,0,0);for(const[,s]of this.bodies)if(s.body.bodyClass===Wt.STAR){const r=s.body.position.x-t.x,o=s.body.position.y-t.y,a=s.body.position.z-t.z,l=Math.sqrt(r*r+o*o+a*a);l<e&&(e=l,n=new D(r/l,o/l,a/l))}return n}getBodyData(t){return this.bodies.get(t)}dispose(){for(const[t]of this.bodies)this.removeBody(t);for(const[,t]of this.geometryCache)t.dispose();this.geometryCache.clear(),this.scene.remove(this.ambientLight),this.ambientLight.dispose()}}const rm=[{type:"O",color:[.6,.7,1],temp:3e4,frequency:3e-5},{type:"B",color:[.7,.8,1],temp:15e3,frequency:.001},{type:"A",color:[.9,.9,1],temp:8500,frequency:.006},{type:"F",color:[1,1,.95],temp:6750,frequency:.03},{type:"G",color:[1,1,.8],temp:5500,frequency:.076},{type:"K",color:[1,.9,.7],temp:4250,frequency:.121},{type:"M",color:[1,.7,.5],temp:3e3,frequency:.765}];class Es{constructor(t={}){L(this,"mesh");L(this,"material");L(this,"geometry");L(this,"rng");L(this,"options");L(this,"time",0);this.options={seed:t.seed??42,starCount:t.starCount??1e4,minBrightness:t.minBrightness??.1,maxBrightness:t.maxBrightness??1,radius:t.radius??1e12,twinkle:t.twinkle??!0},this.rng=new Ui(this.options.seed),this.geometry=this.createGeometry(),this.material=this.createMaterial(),this.mesh=new Sp(this.geometry,this.material),this.mesh.name="starfield",this.mesh.frustumCulled=!1}generateFibonacciPosition(t,e){const n=Math.PI*(3-Math.sqrt(5)),s=1-t/(e-1)*2,r=n*t,o=(this.rng.random()-.5)*.02,a=(this.rng.random()-.5)*.02,l=Math.max(-1,Math.min(1,s+o)),c=r+a,h=Math.sqrt(1-l*l);return new D(Math.cos(c)*h,l,Math.sin(c)*h)}getSpectralColor(){const t=this.rng.random();let e=0;for(const n of rm)if(e+=n.frequency,t<e){const r=n.color[0]??1,o=n.color[1]??.7,a=n.color[2]??.5;return new Gt(r+(this.rng.random()-.5)*.05,o+(this.rng.random()-.5)*.05,a+(this.rng.random()-.5)*.05)}return new Gt(1,.7,.5)}getStarBrightness(){const t=this.rng.random(),n=Math.pow(t,1/(-2.5+1));return this.options.minBrightness+(this.options.maxBrightness-this.options.minBrightness)*n}createGeometry(){const t=new Float32Array(this.options.starCount*3),e=new Float32Array(this.options.starCount*3),n=new Float32Array(this.options.starCount),s=new Float32Array(this.options.starCount),r=new Float32Array(this.options.starCount);for(let a=0;a<this.options.starCount;a++){const l=this.generateFibonacciPosition(a,this.options.starCount);l.multiplyScalar(this.options.radius),t[a*3]=l.x,t[a*3+1]=l.y,t[a*3+2]=l.z;const c=this.getSpectralColor();e[a*3]=c.r,e[a*3+1]=c.g,e[a*3+2]=c.b;const h=this.getStarBrightness();n[a]=h*3,s[a]=this.rng.random()*Math.PI*2,r[a]=.5+this.rng.random()*2}const o=new Ke;return o.setAttribute("position",new Ae(t,3)),o.setAttribute("color",new Ae(e,3)),o.setAttribute("size",new Ae(n,1)),o.setAttribute("twinklePhase",new Ae(s,1)),o.setAttribute("twinkleSpeed",new Ae(r,1)),o}createMaterial(){const t=`
      attribute float size;
      attribute float twinklePhase;
      attribute float twinkleSpeed;
      
      varying vec3 vColor;
      varying float vBrightness;
      
      uniform float time;
      uniform bool enableTwinkle;
      
      void main() {
        vColor = color;
        
        // Calculate twinkle
        float twinkle = 1.0;
        if (enableTwinkle) {
          twinkle = 0.7 + 0.3 * sin(time * twinkleSpeed + twinklePhase);
        }
        vBrightness = twinkle;
        
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        
        // Size attenuation for perspective
        float pointSize = size * (300.0 / -mvPosition.z);
        pointSize = clamp(pointSize, 1.0, 10.0);
        
        gl_PointSize = pointSize;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,e=`
      varying vec3 vColor;
      varying float vBrightness;
      
      void main() {
        // Circular point with soft edge
        vec2 center = gl_PointCoord - vec2(0.5);
        float dist = length(center);
        
        if (dist > 0.5) {
          discard;
        }
        
        // Soft glow falloff
        float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
        
        // Add slight bloom effect
        float bloom = exp(-dist * 4.0) * 0.5;
        
        vec3 color = vColor * vBrightness * (alpha + bloom);
        
        gl_FragColor = vec4(color, alpha);
      }
    `;return new fn({vertexShader:t,fragmentShader:e,uniforms:{time:{value:0},enableTwinkle:{value:this.options.twinkle}},vertexColors:!0,transparent:!0,depthWrite:!1,blending:ps})}getMesh(){return this.mesh}update(t){this.options.twinkle&&(this.time+=t,this.material.uniforms.time&&(this.material.uniforms.time.value=this.time))}setPosition(t,e,n){this.mesh.position.set(t,e,n)}regenerate(t){this.options.seed=t,this.rng=new Ui(t),this.geometry.dispose(),this.geometry=this.createGeometry(),this.mesh.geometry=this.geometry}setTwinkle(t){this.options.twinkle=t,this.material.uniforms.enableTwinkle&&(this.material.uniforms.enableTwinkle.value=t)}dispose(){this.geometry.dispose(),this.material.dispose()}static verifyDeterminism(t,e=100){const n=new Es({seed:t,starCount:e}),s=new Es({seed:t,starCount:e}),r=n.geometry.getAttribute("position").array,o=s.geometry.getAttribute("position").array;for(let a=0;a<r.length;a++)if(r[a]!==o[a])return console.error(`Starfield verification failed at index ${a}: ${r[a]} !== ${o[a]}`),n.dispose(),s.dispose(),!1;return n.dispose(),s.dispose(),console.log(`Starfield verification passed: ${e} stars with seed ${t}`),!0}}class am{constructor(t){L(this,"state");L(this,"prevState");L(this,"canvas");L(this,"isPointerLocked",!1);L(this,"keyBindings",new Map([["KeyW","forward"],["KeyS","backward"],["KeyA","left"],["KeyD","right"],["Space","up"],["ShiftLeft","down"],["ControlLeft","boost"],["KeyE","jump"],["KeyF","interact"],["KeyC","toggleCamera"],["Escape","pause"],["Enter","chat"],["KeyT","chat"]]));L(this,"mouseSensitivity",.002);L(this,"onPointerLock");L(this,"onPauseToggle");L(this,"onChatToggle");this.canvas=t,this.state=this.createEmptyState(),this.prevState=this.createEmptyState(),this.setupEventListeners()}createEmptyState(){return{forward:!1,backward:!1,left:!1,right:!1,up:!1,down:!1,boost:!1,jump:!1,interact:!1,toggleCamera:!1,pause:!1,chat:!1,mouseX:0,mouseY:0,mouseDeltaX:0,mouseDeltaY:0,mouseButtons:[!1,!1,!1],scroll:0}}setupEventListeners(){window.addEventListener("keydown",this.handleKeyDown.bind(this)),window.addEventListener("keyup",this.handleKeyUp.bind(this)),this.canvas.addEventListener("mousedown",this.handleMouseDown.bind(this)),this.canvas.addEventListener("mouseup",this.handleMouseUp.bind(this)),this.canvas.addEventListener("mousemove",this.handleMouseMove.bind(this)),this.canvas.addEventListener("wheel",this.handleWheel.bind(this)),this.canvas.addEventListener("click",()=>{!this.isPointerLocked&&document.activeElement!==document.querySelector("#chat-input")&&this.requestPointerLock()}),document.addEventListener("pointerlockchange",this.handlePointerLockChange.bind(this)),document.addEventListener("pointerlockerror",()=>{console.error("Pointer lock error")}),this.canvas.addEventListener("contextmenu",t=>t.preventDefault())}handleKeyDown(t){var n,s,r;if(((n=document.activeElement)==null?void 0:n.id)==="chat-input"){t.code==="Escape"&&(document.activeElement.blur(),this.requestPointerLock());return}const e=this.keyBindings.get(t.code);e&&typeof this.state[e]=="boolean"&&(this.state[e]=!0,e==="pause"&&!this.prevState.pause&&((s=this.onPauseToggle)==null||s.call(this),this.exitPointerLock()),e==="chat"&&!this.prevState.chat&&((r=this.onChatToggle)==null||r.call(this),this.exitPointerLock()),t.preventDefault())}handleKeyUp(t){var n;if(((n=document.activeElement)==null?void 0:n.id)==="chat-input")return;const e=this.keyBindings.get(t.code);e&&typeof this.state[e]=="boolean"&&(this.state[e]=!1,t.preventDefault())}handleMouseDown(t){t.button<3&&(this.state.mouseButtons[t.button]=!0)}handleMouseUp(t){t.button<3&&(this.state.mouseButtons[t.button]=!1)}handleMouseMove(t){this.isPointerLocked&&(this.state.mouseDeltaX+=t.movementX*this.mouseSensitivity,this.state.mouseDeltaY+=t.movementY*this.mouseSensitivity),this.state.mouseX=t.clientX,this.state.mouseY=t.clientY}handleWheel(t){this.state.scroll+=t.deltaY>0?1:-1,t.preventDefault()}handlePointerLockChange(){var t;this.isPointerLocked=document.pointerLockElement===this.canvas,(t=this.onPointerLock)==null||t.call(this,this.isPointerLocked)}requestPointerLock(){this.canvas.requestPointerLock()}exitPointerLock(){document.exitPointerLock()}getState(){return{...this.state}}getMouseDelta(){const t={x:this.state.mouseDeltaX,y:this.state.mouseDeltaY};return this.state.mouseDeltaX=0,this.state.mouseDeltaY=0,t}getScroll(){const t=this.state.scroll;return this.state.scroll=0,t}toPlayerInputState(t){return{sequence:t,forward:this.state.forward,backward:this.state.backward,left:this.state.left,right:this.state.right,up:this.state.up,down:this.state.down,jump:this.state.jump,sprint:this.state.boost,pitchUp:this.state.mouseDeltaY>0,pitchDown:this.state.mouseDeltaY<0,yawLeft:this.state.mouseDeltaX<0,yawRight:this.state.mouseDeltaX>0,rollLeft:!1,rollRight:!1,thrustX:0,thrustY:0,thrustZ:0,primaryAction:!1,secondaryAction:!1,cameraYaw:this.state.mouseDeltaX,cameraYitch:this.state.mouseDeltaY}}endFrame(){this.prevState={...this.state},this.state.toggleCamera=!1,this.state.jump=!1,this.state.interact=!1}wasJustPressed(t){return this.state[t]===!0&&this.prevState[t]===!1}wasJustReleased(t){return this.state[t]===!1&&this.prevState[t]===!0}isLocked(){return this.isPointerLocked}dispose(){window.removeEventListener("keydown",this.handleKeyDown.bind(this)),window.removeEventListener("keyup",this.handleKeyUp.bind(this))}}class om{constructor(t,e={}){L(this,"ws",null);L(this,"config");L(this,"events");L(this,"isConnected",!1);L(this,"reconnectAttempts",0);L(this,"maxReconnectAttempts",5);L(this,"reconnectDelay",1e3);L(this,"lastPingTime",0);L(this,"latency",0);L(this,"pingInterval",null);L(this,"inputSequence",0);L(this,"playerId",null);L(this,"playerName","Player");L(this,"idHashMap",new Map);this.config=t,this.events=e}async connect(t){return new Promise(e=>{var r,o;this.playerName=t;const s=`${this.config.secure?"wss":"ws"}://${this.config.host}:${this.config.port}`;try{this.ws=new WebSocket(s),this.ws.binaryType="arraybuffer",this.ws.onopen=()=>{var l,c;console.log("Connected to server"),this.isConnected=!0,this.reconnectAttempts=0;const a={type:pe.JOIN,timestamp:Date.now(),playerName:t};this.send(a),this.startPing(),(c=(l=this.events).onConnect)==null||c.call(l),e(!0)},this.ws.onclose=a=>{var c,h;this.isConnected=!1,this.stopPing();const l=a.reason||"Connection closed";console.log("Disconnected:",l),(h=(c=this.events).onDisconnect)==null||h.call(c,l),this.attemptReconnect(),e(!1)},this.ws.onerror=a=>{var l,c;console.error("WebSocket error:",a),(c=(l=this.events).onError)==null||c.call(l,new Error("WebSocket connection error")),e(!1)},this.ws.onmessage=this.handleMessage.bind(this)}catch(a){console.error("Failed to connect:",a),(o=(r=this.events).onError)==null||o.call(r,a),e(!1)}})}handleMessage(t){var e,n,s,r,o,a,l,c,h,d,p,m,_,g;try{if(t.data instanceof ArrayBuffer){const u=jp(t.data,this.idHashMap);console.log("Received binary state update:",u.states.length,"bodies");return}const f=JSON.parse(t.data);switch(f.type){case pe.JOINED:{const u=f;this.playerId=u.playerId,console.log("Joined as player:",this.playerId);break}case pe.PLAYER_JOINED:{const u=f;(n=(e=this.events).onPlayerJoined)==null||n.call(e,u.playerId,u.playerName);break}case pe.PLAYER_LEFT:{const u=f;(r=(s=this.events).onPlayerLeft)==null||r.call(s,u.playerId);break}case pe.CHAT_MESSAGE:{const u=f;(a=(o=this.events).onChat)==null||a.call(o,u.playerId,u.playerName,u.message);break}case pe.BODY_ADD:{const u=f;(c=(l=this.events).onBodyAdded)==null||c.call(l,u.body);break}case pe.BODY_REMOVE:{const u=f;(d=(h=this.events).onBodyRemoved)==null||d.call(h,u.bodyId);break}case pe.WORLD_STATE:{const u=f;this.idHashMap=Zp(u.bodies.map(T=>T.id)),(m=(p=this.events).onWorldState)==null||m.call(p,u);break}case pe.PONG:{const u=f;this.latency=performance.now()-u.clientTime,(g=(_=this.events).onPing)==null||g.call(_,this.latency);break}case pe.ERROR:{console.error("Server error:",f.message);break}default:console.warn("Unknown message type:",f.type)}}catch(f){console.error("Failed to handle message:",f)}}send(t){if(!this.ws||!this.isConnected){console.warn("Cannot send: not connected");return}try{this.ws.send(JSON.stringify(t))}catch(e){console.error("Failed to send message:",e)}}sendInput(t){if(!this.isConnected)return;const e={...t,sequence:this.inputSequence++},n={type:pe.PLAYER_INPUT,timestamp:Date.now(),playerId:this.playerId||"",input:e};this.send(n)}sendChat(t){const e={type:pe.CHAT_MESSAGE,timestamp:Date.now(),playerId:this.playerId||"",playerName:this.playerName,message:t};this.send(e)}requestSpawn(t){console.log("Spawn request not yet implemented")}addBody(t){const e={type:pe.BODY_ADD,timestamp:Date.now(),body:t};this.send(e)}removeBody(t){const e={type:pe.BODY_REMOVE,timestamp:Date.now(),bodyId:t};this.send(e)}startPing(){this.pingInterval=window.setInterval(()=>{if(this.isConnected){this.lastPingTime=performance.now();const t={type:pe.PING,timestamp:Date.now(),clientTime:this.lastPingTime};this.send(t)}},1e3)}stopPing(){this.pingInterval&&(clearInterval(this.pingInterval),this.pingInterval=null)}attemptReconnect(){if(this.reconnectAttempts>=this.maxReconnectAttempts){console.log("Max reconnect attempts reached");return}this.reconnectAttempts++;const t=this.reconnectDelay*Math.pow(2,this.reconnectAttempts-1);console.log(`Attempting reconnect in ${t}ms...`),setTimeout(()=>{this.isConnected||this.connect(this.playerName)},t)}disconnect(){this.stopPing(),this.ws&&(this.ws.close(),this.ws=null),this.isConnected=!1}isConnectedToServer(){return this.isConnected}getPlayerId(){return this.playerId}getLatency(){return this.latency}getInputSequence(){return this.inputSequence}}class lm{constructor(){L(this,"elements");L(this,"state","connecting");L(this,"selectedSpawnBody",null);L(this,"storedBodies",[]);L(this,"onConnect");L(this,"onSpawn");L(this,"onChat");L(this,"onResume");this.elements=this.getElements(),this.setupEventListeners()}getBodies(){return this.storedBodies}getElements(){return{connectionModal:document.getElementById("connection-modal"),spawnModal:document.getElementById("spawn-modal"),controlsModal:document.getElementById("controls-modal"),pauseOverlay:document.getElementById("pause-overlay"),playerNameInput:document.getElementById("player-name"),connectBtn:document.getElementById("connect-btn"),planetGrid:document.getElementById("planet-grid"),spawnBtn:document.getElementById("spawn-btn"),controlsOkBtn:document.getElementById("controls-ok-btn"),hud:document.getElementById("hud"),positionX:document.getElementById("pos-x"),positionY:document.getElementById("pos-y"),positionZ:document.getElementById("pos-z"),velocityMag:document.getElementById("vel-mag"),altitudeValue:document.getElementById("altitude-value"),nearestBody:document.getElementById("nearest-body"),fpsValue:document.getElementById("fps-value"),latencyValue:document.getElementById("latency-value"),bodiesValue:document.getElementById("bodies-value"),playersValue:document.getElementById("players-value"),chatMessages:document.getElementById("chat-messages"),chatInput:document.getElementById("chat-input"),minimap:document.getElementById("minimap")}}setupEventListeners(){this.elements.connectBtn.addEventListener("click",()=>{var e;const t=this.elements.playerNameInput.value.trim();t.length>0&&((e=this.onConnect)==null||e.call(this,t))}),this.elements.playerNameInput.addEventListener("keydown",t=>{t.key==="Enter"&&this.elements.connectBtn.click()}),this.elements.spawnBtn.addEventListener("click",()=>{var t;this.selectedSpawnBody&&((t=this.onSpawn)==null||t.call(this,this.selectedSpawnBody))}),this.elements.controlsOkBtn.addEventListener("click",()=>{this.hideControlsModal(),this.setState("playing")}),this.elements.chatInput.addEventListener("keydown",t=>{var e;if(t.key==="Enter"){const n=this.elements.chatInput.value.trim();n.length>0&&((e=this.onChat)==null||e.call(this,n),this.elements.chatInput.value=""),this.elements.chatInput.blur(),t.preventDefault()}t.key==="Escape"&&(this.elements.chatInput.blur(),t.preventDefault())}),this.elements.pauseOverlay.addEventListener("click",()=>{var t;(t=this.onResume)==null||t.call(this)})}setState(t){this.state=t,this.updateVisibility()}getState(){return this.state}updateVisibility(){switch(this.elements.connectionModal.classList.add("hidden"),this.elements.spawnModal.classList.add("hidden"),this.elements.controlsModal.classList.add("hidden"),this.elements.pauseOverlay.classList.add("hidden"),this.elements.hud.classList.add("hidden"),this.state){case"connecting":this.elements.connectionModal.classList.remove("hidden"),this.elements.playerNameInput.focus();break;case"spawn-select":this.elements.spawnModal.classList.remove("hidden");break;case"playing":this.elements.hud.classList.remove("hidden");break;case"paused":this.elements.hud.classList.remove("hidden"),this.elements.pauseOverlay.classList.remove("hidden");break;case"chat":this.elements.hud.classList.remove("hidden"),this.elements.chatInput.focus();break;case"world-builder":this.elements.hud.classList.remove("hidden");break}}showControlsModal(){this.elements.controlsModal.classList.remove("hidden")}hideControlsModal(){this.elements.controlsModal.classList.add("hidden")}populateSpawnSelection(t){this.storedBodies=t,this.elements.planetGrid.innerHTML="";const e=t.filter(n=>n.bodyClass===Wt.TERRESTRIAL||n.bodyClass===Wt.GAS_GIANT||n.bodyClass===Wt.ICE_GIANT||n.bodyClass===Wt.MOON);for(const n of e){const s=this.createPlanetCard(n);this.elements.planetGrid.appendChild(s)}if(e.length>0&&!this.selectedSpawnBody){const n=e[0];n&&this.selectSpawnBody(n.id)}}createPlanetCard(t){const e=document.createElement("div");e.className="planet-card",e.dataset.bodyId=t.id;const n=l=>Math.floor(l[0]*255)<<16|Math.floor(l[1]*255)<<8|Math.floor(l[2]*255),s=document.createElement("div");s.style.width="60px",s.style.height="60px",s.style.borderRadius="50%",s.style.backgroundColor=`#${n(t.color).toString(16).padStart(6,"0")}`,s.style.marginBottom="0.5rem",s.style.boxShadow="0 0 20px rgba(255,255,255,0.2)",e.appendChild(s);const r=document.createElement("div");r.textContent=t.name,r.style.fontWeight="bold",r.style.fontSize="1.1rem",e.appendChild(r);const o=document.createElement("div");o.textContent=t.type,o.style.fontSize="0.8rem",o.style.opacity="0.7",o.style.marginBottom="0.5rem",e.appendChild(o);const a=document.createElement("div");return a.style.fontSize="0.75rem",a.style.opacity="0.6",a.innerHTML=`
      <div>Radius: ${Ri(t.radius)}</div>
      <div>Mass: ${Ip(t.mass)}</div>
    `,e.appendChild(a),e.addEventListener("click",()=>{this.selectSpawnBody(t.id)}),e}selectSpawnBody(t){this.selectedSpawnBody=t,this.elements.planetGrid.querySelectorAll(".planet-card").forEach(n=>{n.classList.remove("selected"),n.dataset.bodyId===t&&n.classList.add("selected")}),this.elements.spawnBtn.classList.remove("disabled")}updatePosition(t,e,n){this.elements.positionX.textContent=Ri(t),this.elements.positionY.textContent=Ri(e),this.elements.positionZ.textContent=Ri(n)}updateVelocity(t){t>1e3?this.elements.velocityMag.textContent=`${(t/1e3).toFixed(2)} km/s`:this.elements.velocityMag.textContent=`${t.toFixed(2)} m/s`}updateAltitude(t,e){this.elements.altitudeValue.textContent=Ri(t),this.elements.nearestBody.textContent=e}updateDiagnostics(t,e,n,s){this.elements.fpsValue.textContent=t.toFixed(0),this.elements.latencyValue.textContent=`${e.toFixed(0)}ms`,this.elements.bodiesValue.textContent=n.toString(),this.elements.playersValue.textContent=s.toString()}addChatMessage(t,e,n=!1){const s=document.createElement("div");for(s.className="chat-message",n?s.innerHTML=`<span style="color: #ffcc00">${e}</span>`:s.innerHTML=`<strong>${t}:</strong> ${e}`,this.elements.chatMessages.appendChild(s),this.elements.chatMessages.scrollTop=this.elements.chatMessages.scrollHeight;this.elements.chatMessages.children.length>50;)this.elements.chatMessages.removeChild(this.elements.chatMessages.firstChild)}focusChat(){this.elements.chatInput.focus()}updateMinimap(t,e,n,s){const r=this.elements.minimap,o=r.getContext("2d");if(!o)return;const a=r.width/2,l=r.height/2;o.fillStyle="rgba(0, 0, 0, 0.8)",o.fillRect(0,0,r.width,r.height);for(const c of t){const h=a+(c.x-e)/s,d=l+(c.y-n)/s;if(h<-10||h>r.width+10||d<-10||d>r.height+10)continue;const p=Math.max(2,c.radius/s);o.beginPath(),o.arc(h,d,p,0,Math.PI*2),o.fillStyle=`#${c.color.toString(16).padStart(6,"0")}`,o.fill()}o.beginPath(),o.arc(a,l,3,0,Math.PI*2),o.fillStyle="#00ff00",o.fill(),o.strokeStyle="rgba(100, 200, 255, 0.5)",o.lineWidth=1,o.strokeRect(0,0,r.width,r.height)}showConnectionError(t){var n;const e=document.createElement("div");e.className="error-message",e.textContent=t,e.style.color="#ff4444",e.style.marginTop="1rem",(n=this.elements.connectionModal.querySelector(".modal-content"))==null||n.appendChild(e),setTimeout(()=>e.remove(),3e3)}}class cm{constructor(t){L(this,"config");L(this,"renderer");L(this,"scene");L(this,"camera");L(this,"celestialRenderer");L(this,"starfield");L(this,"physics",null);L(this,"player",null);L(this,"localBodies",new Map);L(this,"input");L(this,"network",null);L(this,"ui");L(this,"lastTime",0);L(this,"accumulator",0);L(this,"frameCount",0);L(this,"fpsTime",0);L(this,"fps",60);L(this,"isRunning",!1);L(this,"isPaused",!1);this.config=t,this.renderer=new Qo({canvas:t.canvas,antialias:!0,logarithmicDepthBuffer:!0}),this.renderer.setSize(window.innerWidth,window.innerHeight),this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,2)),this.renderer.outputColorSpace=fe,this.renderer.toneMapping=So,this.renderer.toneMappingExposure=1,this.scene=new xp,this.scene.background=new Gt(5),this.camera=new tm(75,window.innerWidth/window.innerHeight,.1,1e16),this.scene.add(this.camera.camera),this.celestialRenderer=new sm(this.scene,this.camera),this.starfield=new Es({seed:12345,starCount:15e3,radius:1e15}),this.scene.add(this.starfield.getMesh()),this.input=new am(t.canvas),this.input.onPauseToggle=()=>this.togglePause(),this.input.onChatToggle=()=>this.toggleChat(),this.ui=new lm,this.ui.onConnect=e=>this.handleConnect(e),this.ui.onSpawn=e=>this.handleSpawn(e),this.ui.onChat=e=>this.handleChatSend(e),this.ui.onResume=()=>this.resume(),window.addEventListener("resize",this.handleResize.bind(this)),t.offlineMode||(this.network=new om({host:t.serverHost,port:t.serverPort,secure:!1},{onConnect:()=>this.onNetworkConnect(),onDisconnect:e=>this.onNetworkDisconnect(e),onWorldState:e=>this.onWorldState(e),onPlayerJoined:(e,n)=>this.onPlayerJoined(e,n),onPlayerLeft:e=>this.onPlayerLeft(e),onChat:(e,n,s)=>this.onChatReceived(e,n,s),onBodyAdded:e=>this.onBodyAdded(e),onBodyRemoved:e=>this.onBodyRemoved(e),onSpawnConfirm:(e,n)=>this.onSpawnConfirm(e,n),onPing:e=>this.onPing(e)}))}async start(){console.log("Starting Space Simulator..."),this.config.offlineMode?this.initializeOfflineMode():this.ui.setState("connecting"),this.isRunning=!0,this.lastTime=performance.now(),requestAnimationFrame(this.gameLoop.bind(this))}initializeOfflineMode(){console.log("Starting in offline mode...");const t=Vp("sun-earth-moon");this.physics=$p({gravityMethod:yn.BARNES_HUT,barnesHutTheta:.5});for(const n of t.bodies){const s=new ui(n);this.physics.addBody(n),this.localBodies.set(s.id,s),this.celestialRenderer.addBody(s)}this.player=new Qp("offline-player","Player"),this.player.mode=de.SPACE;const e=this.localBodies.get("earth");if(e){const n=e.radius+1e4;this.player.position.set(e.position.x+n,e.position.y,e.position.z),this.camera.setWorldPosition(this.player.position.x,this.player.position.y,this.player.position.z)}this.ui.populateSpawnSelection(t.bodies),this.ui.showControlsModal(),this.ui.setState("playing")}gameLoop(t){if(!this.isRunning)return;const e=(t-this.lastTime)/1e3;this.lastTime=t;const n=Math.min(e,.1);this.frameCount++,this.fpsTime+=e,this.fpsTime>=1&&(this.fps=this.frameCount/this.fpsTime,this.frameCount=0,this.fpsTime=0),this.isPaused||this.update(n),this.render(),this.updateUI(),this.input.endFrame(),requestAnimationFrame(this.gameLoop.bind(this))}update(t){if(this.starfield.update(t),!(this.ui.getState()!=="playing"&&this.ui.getState()!=="chat")){if(this.processInput(t),this.config.offlineMode&&this.physics){for(this.accumulator+=t;this.accumulator>=ur;)this.physics.step(ur),this.accumulator-=ur;for(const e of this.physics.getAllBodies())this.localBodies.set(e.id,e)}this.celestialRenderer.update()}}processInput(t){var p;if(!this.player||!this.input.isLocked())return;const e=this.input.getMouseDelta();this.camera.rotate(-e.x,-e.y);const n=this.input.getState(),s=n.boost?1e6:1e4,r=this.camera.getForward(),o=this.camera.getRight(),a=this.camera.getUp();let l=0,c=0,h=0;if(n.forward&&(l+=r.x*s*t,c+=r.y*s*t,h+=r.z*s*t),n.backward&&(l-=r.x*s*t,c-=r.y*s*t,h-=r.z*s*t),n.right&&(l+=o.x*s*t,c+=o.y*s*t,h+=o.z*s*t),n.left&&(l-=o.x*s*t,c-=o.y*s*t,h-=o.z*s*t),n.up&&(l+=a.x*s*t,c+=a.y*s*t,h+=a.z*s*t),n.down&&(l-=a.x*s*t,c-=a.y*s*t,h-=a.z*s*t),this.player.position.x+=l,this.player.position.y+=c,this.player.position.z+=h,this.camera.setWorldPosition(this.player.position.x,this.player.position.y,this.player.position.z),(p=this.network)!=null&&p.isConnectedToServer()){const m=this.input.toPlayerInputState(this.network.getInputSequence());this.network.sendInput(m)}const d=this.input.getScroll();if(d!==0){const m=this.camera.camera.fov,_=Math.max(10,Math.min(120,m+d*5));this.camera.setFOV(_)}}render(){this.starfield.setPosition(0,0,0),this.renderer.render(this.scene,this.camera.camera)}updateUI(){var n,s,r;if(this.ui.getState()!=="playing"&&this.ui.getState()!=="chat")return;if(this.player){this.ui.updatePosition(this.player.position.x,this.player.position.y,this.player.position.z);const o=Math.sqrt(this.player.velocity.x**2+this.player.velocity.y**2+this.player.velocity.z**2);this.ui.updateVelocity(o);let a=1/0,l=null;for(const c of this.localBodies.values()){const h=c.position.x-this.player.position.x,d=c.position.y-this.player.position.y,p=c.position.z-this.player.position.z,m=Math.sqrt(h*h+d*d+p*p);m<a&&(a=m,l=c)}if(l){const c=a-l.radius;this.ui.updateAltitude(c,l.name)}}this.ui.updateDiagnostics(this.fps,((n=this.network)==null?void 0:n.getLatency())??0,this.localBodies.size,1);const t=o=>Math.floor(o[0]*255)<<16|Math.floor(o[1]*255)<<8|Math.floor(o[2]*255),e=Array.from(this.localBodies.values()).map(o=>({x:o.position.x,y:o.position.z,radius:o.radius,color:t(o.color)}));this.ui.updateMinimap(e,((s=this.player)==null?void 0:s.position.x)??0,((r=this.player)==null?void 0:r.position.z)??0,ve/10)}handleResize(){const t=window.innerWidth,e=window.innerHeight;this.renderer.setSize(t,e),this.camera.setAspect(t/e)}async handleConnect(t){this.network&&(await this.network.connect(t)||this.ui.showConnectionError("Failed to connect to server"))}handleSpawn(t){var e;if((e=this.network)!=null&&e.isConnectedToServer())this.network.requestSpawn(t);else if(this.config.offlineMode){const n=this.localBodies.get(t);if(n&&this.player){const s=n.radius+1e4;this.player.position.set(n.position.x+s,n.position.y,n.position.z),this.camera.setWorldPosition(this.player.position.x,this.player.position.y,this.player.position.z),this.ui.showControlsModal()}}}handleChatSend(t){var e;(e=this.network)!=null&&e.isConnectedToServer()&&this.network.sendChat(t),this.ui.addChatMessage("You",t)}togglePause(){this.isPaused?this.resume():this.pause()}pause(){this.isPaused=!0,this.ui.setState("paused")}resume(){this.isPaused=!1,this.ui.setState("playing"),this.input.requestPointerLock()}toggleChat(){this.ui.getState()==="chat"?(this.ui.setState("playing"),this.input.requestPointerLock()):this.ui.getState()==="playing"&&(this.ui.setState("chat"),this.ui.focusChat())}onNetworkConnect(){console.log("Connected to server")}onNetworkDisconnect(t){console.log("Disconnected:",t),this.ui.addChatMessage("System",`Disconnected: ${t}`,!0)}onWorldState(t){for(const e of t.bodies){let n=this.localBodies.get(e.id);n?(n.position.set(e.position.x,e.position.y,e.position.z),n.velocity.set(e.velocity.x,e.velocity.y,e.velocity.z)):(n=new ui(e),this.localBodies.set(n.id,n),this.celestialRenderer.addBody(n))}}onPlayerJoined(t,e){this.ui.addChatMessage("System",`${e} joined the game`,!0)}onPlayerLeft(t){this.ui.addChatMessage("System","A player left the game",!0)}onChatReceived(t,e,n){var s;t!==((s=this.network)==null?void 0:s.getPlayerId())&&this.ui.addChatMessage(e,n)}onBodyAdded(t){const e=new ui(t);this.localBodies.set(e.id,e),this.celestialRenderer.addBody(e)}onBodyRemoved(t){this.localBodies.delete(t),this.celestialRenderer.removeBody(t)}onSpawnConfirm(t,e){t&&this.player?(this.player.position.copy(e),this.camera.setWorldPosition(e.x,e.y,e.z),this.ui.showControlsModal()):this.ui.addChatMessage("System","Failed to spawn",!0)}onPing(t){}stop(){var t;this.isRunning=!1,(t=this.network)==null||t.disconnect(),this.celestialRenderer.dispose(),this.starfield.dispose(),this.renderer.dispose()}}const Ir=new URLSearchParams(window.location.search),go=Ir.get("host")||"localhost",_o=parseInt(Ir.get("port")||"8080",10),vo=Ir.get("offline")==="true";document.addEventListener("DOMContentLoaded",async()=>{console.log("Space Simulator initializing..."),console.log(`Server: ${go}:${_o}`),console.log(`Offline mode: ${vo}`);const i=document.getElementById("game-canvas");if(!i){console.error("Canvas element not found!");return}const t=new cm({canvas:i,serverHost:go,serverPort:_o,offlineMode:vo});await t.start(),window.addEventListener("beforeunload",()=>{t.stop()}),window.game=t,console.log("Space Simulator started!"),console.log("Controls: WASD to move, Space/Shift for up/down, Ctrl for boost"),console.log("Press ESC to pause, T or Enter for chat")});
//# sourceMappingURL=index-3Of408fB.js.map
