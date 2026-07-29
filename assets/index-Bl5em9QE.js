(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))i(n);new MutationObserver(n=>{for(const r of n)if(r.type==="childList")for(const a of r.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&i(a)}).observe(document,{childList:!0,subtree:!0});function t(n){const r={};return n.integrity&&(r.integrity=n.integrity),n.referrerPolicy&&(r.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?r.credentials="include":n.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(n){if(n.ep)return;n.ep=!0;const r=t(n);fetch(n.href,r)}})();/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const Ba="172",Ic=0,lo=1,Dc=2,Vl=1,Lc=2,pi=3,Li=0,Ut=1,Ct=2,Ii=0,vi=1,$i=2,co=3,ho=4,Fc=5,Wi=100,Uc=101,Bc=102,Nc=103,Oc=104,zc=200,kc=201,Hc=202,Vc=203,$r=204,Yr=205,Gc=206,Wc=207,Xc=208,qc=209,$c=210,Yc=211,Zc=212,Kc=213,jc=214,Zr=0,Kr=1,jr=2,Rn=3,Qr=4,Jr=5,ea=6,ta=7,Na=0,Qc=1,Jc=2,Di=0,eh=1,th=2,ih=3,Gl=4,nh=5,sh=6,rh=7,Wl=300,Cn=301,An=302,ia=303,na=304,sr=306,ts=1e3,qi=1001,sa=1002,Vt=1003,ah=1004,hs=1005,Ht=1006,hr=1007,Pi=1008,_i=1009,Xl=1010,ql=1011,is=1012,Oa=1013,Zi=1014,ai=1015,as=1016,za=1017,ka=1018,Pn=1020,$l=35902,Yl=1021,Zl=1022,Zt=1023,Kl=1024,jl=1025,En=1026,In=1027,Ha=1028,Va=1029,Ql=1030,Ga=1031,Wa=1033,Gs=33776,Ws=33777,Xs=33778,qs=33779,ra=35840,aa=35841,oa=35842,la=35843,ca=36196,ha=37492,ua=37496,da=37808,fa=37809,pa=37810,ma=37811,ga=37812,va=37813,ya=37814,xa=37815,_a=37816,ba=37817,Sa=37818,Ma=37819,Ea=37820,wa=37821,$s=36492,Ta=36494,Ra=36495,Jl=36283,Ca=36284,Aa=36285,Pa=36286,oh=3200,lh=3201,Xa=0,ch=1,Ai="",Dt="srgb",Dn="srgb-linear",Ks="linear",tt="srgb",en=7680,uo=519,hh=512,uh=513,dh=514,ec=515,fh=516,ph=517,mh=518,gh=519,Ia=35044,us=35048,fo="300 es",mi=2e3,js=2001;class Fn{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;const i=this._listeners;return i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;const n=this._listeners[e];if(n!==void 0){const r=n.indexOf(t);r!==-1&&n.splice(r,1)}}dispatchEvent(e){if(this._listeners===void 0)return;const i=this._listeners[e.type];if(i!==void 0){e.target=this;const n=i.slice(0);for(let r=0,a=n.length;r<a;r++)n[r].call(this,e);e.target=null}}}const wt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let po=1234567;const Qn=Math.PI/180,ns=180/Math.PI;function yi(){const s=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(wt[s&255]+wt[s>>8&255]+wt[s>>16&255]+wt[s>>24&255]+"-"+wt[e&255]+wt[e>>8&255]+"-"+wt[e>>16&15|64]+wt[e>>24&255]+"-"+wt[t&63|128]+wt[t>>8&255]+"-"+wt[t>>16&255]+wt[t>>24&255]+wt[i&255]+wt[i>>8&255]+wt[i>>16&255]+wt[i>>24&255]).toLowerCase()}function ke(s,e,t){return Math.max(e,Math.min(t,s))}function qa(s,e){return(s%e+e)%e}function vh(s,e,t,i,n){return i+(s-e)*(n-i)/(t-e)}function yh(s,e,t){return s!==e?(t-s)/(e-s):0}function Jn(s,e,t){return(1-t)*s+t*e}function xh(s,e,t,i){return Jn(s,e,1-Math.exp(-t*i))}function _h(s,e=1){return e-Math.abs(qa(s,e*2)-e)}function bh(s,e,t){return s<=e?0:s>=t?1:(s=(s-e)/(t-e),s*s*(3-2*s))}function Sh(s,e,t){return s<=e?0:s>=t?1:(s=(s-e)/(t-e),s*s*s*(s*(s*6-15)+10))}function Mh(s,e){return s+Math.floor(Math.random()*(e-s+1))}function Eh(s,e){return s+Math.random()*(e-s)}function wh(s){return s*(.5-Math.random())}function Th(s){s!==void 0&&(po=s);let e=po+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function Rh(s){return s*Qn}function Ch(s){return s*ns}function Ah(s){return(s&s-1)===0&&s!==0}function Ph(s){return Math.pow(2,Math.ceil(Math.log(s)/Math.LN2))}function Ih(s){return Math.pow(2,Math.floor(Math.log(s)/Math.LN2))}function Dh(s,e,t,i,n){const r=Math.cos,a=Math.sin,o=r(t/2),l=a(t/2),c=r((e+i)/2),h=a((e+i)/2),d=r((e-i)/2),f=a((e-i)/2),p=r((i-e)/2),g=a((i-e)/2);switch(n){case"XYX":s.set(o*h,l*d,l*f,o*c);break;case"YZY":s.set(l*f,o*h,l*d,o*c);break;case"ZXZ":s.set(l*d,l*f,o*h,o*c);break;case"XZX":s.set(o*h,l*g,l*p,o*c);break;case"YXY":s.set(l*p,o*h,l*g,o*c);break;case"ZYZ":s.set(l*g,l*p,o*h,o*c);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+n)}}function ii(s,e){switch(e.constructor){case Float32Array:return s;case Uint32Array:return s/4294967295;case Uint16Array:return s/65535;case Uint8Array:return s/255;case Int32Array:return Math.max(s/2147483647,-1);case Int16Array:return Math.max(s/32767,-1);case Int8Array:return Math.max(s/127,-1);default:throw new Error("Invalid component type.")}}function et(s,e){switch(e.constructor){case Float32Array:return s;case Uint32Array:return Math.round(s*4294967295);case Uint16Array:return Math.round(s*65535);case Uint8Array:return Math.round(s*255);case Int32Array:return Math.round(s*2147483647);case Int16Array:return Math.round(s*32767);case Int8Array:return Math.round(s*127);default:throw new Error("Invalid component type.")}}const mo={DEG2RAD:Qn,RAD2DEG:ns,generateUUID:yi,clamp:ke,euclideanModulo:qa,mapLinear:vh,inverseLerp:yh,lerp:Jn,damp:xh,pingpong:_h,smoothstep:bh,smootherstep:Sh,randInt:Mh,randFloat:Eh,randFloatSpread:wh,seededRandom:Th,degToRad:Rh,radToDeg:Ch,isPowerOfTwo:Ah,ceilPowerOfTwo:Ph,floorPowerOfTwo:Ih,setQuaternionFromProperEuler:Dh,normalize:et,denormalize:ii};class Te{constructor(e=0,t=0){Te.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,i=this.y,n=e.elements;return this.x=n[0]*t+n[3]*i+n[6],this.y=n[1]*t+n[4]*i+n[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=ke(this.x,e.x,t.x),this.y=ke(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=ke(this.x,e,t),this.y=ke(this.y,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(ke(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(ke(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y;return t*t+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const i=Math.cos(t),n=Math.sin(t),r=this.x-e.x,a=this.y-e.y;return this.x=r*i-a*n+e.x,this.y=r*n+a*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Fe{constructor(e,t,i,n,r,a,o,l,c){Fe.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,i,n,r,a,o,l,c)}set(e,t,i,n,r,a,o,l,c){const h=this.elements;return h[0]=e,h[1]=n,h[2]=o,h[3]=t,h[4]=r,h[5]=l,h[6]=i,h[7]=a,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],this}extractBasis(e,t,i){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,n=t.elements,r=this.elements,a=i[0],o=i[3],l=i[6],c=i[1],h=i[4],d=i[7],f=i[2],p=i[5],g=i[8],y=n[0],m=n[3],u=n[6],v=n[1],_=n[4],x=n[7],T=n[2],C=n[5],A=n[8];return r[0]=a*y+o*v+l*T,r[3]=a*m+o*_+l*C,r[6]=a*u+o*x+l*A,r[1]=c*y+h*v+d*T,r[4]=c*m+h*_+d*C,r[7]=c*u+h*x+d*A,r[2]=f*y+p*v+g*T,r[5]=f*m+p*_+g*C,r[8]=f*u+p*x+g*A,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[1],n=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8];return t*a*h-t*o*c-i*r*h+i*o*l+n*r*c-n*a*l}invert(){const e=this.elements,t=e[0],i=e[1],n=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8],d=h*a-o*c,f=o*l-h*r,p=c*r-a*l,g=t*d+i*f+n*p;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const y=1/g;return e[0]=d*y,e[1]=(n*c-h*i)*y,e[2]=(o*i-n*a)*y,e[3]=f*y,e[4]=(h*t-n*l)*y,e[5]=(n*r-o*t)*y,e[6]=p*y,e[7]=(i*l-c*t)*y,e[8]=(a*t-i*r)*y,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,i,n,r,a,o){const l=Math.cos(r),c=Math.sin(r);return this.set(i*l,i*c,-i*(l*a+c*o)+a+e,-n*c,n*l,-n*(-c*a+l*o)+o+t,0,0,1),this}scale(e,t){return this.premultiply(ur.makeScale(e,t)),this}rotate(e){return this.premultiply(ur.makeRotation(-e)),this}translate(e,t){return this.premultiply(ur.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,i,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,i=e.elements;for(let n=0;n<9;n++)if(t[n]!==i[n])return!1;return!0}fromArray(e,t=0){for(let i=0;i<9;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const ur=new Fe;function tc(s){for(let e=s.length-1;e>=0;--e)if(s[e]>=65535)return!0;return!1}function ss(s){return document.createElementNS("http://www.w3.org/1999/xhtml",s)}function Lh(){const s=ss("canvas");return s.style.display="block",s}const go={};function bn(s){s in go||(go[s]=!0,console.warn(s))}function Fh(s,e,t){return new Promise(function(i,n){function r(){switch(s.clientWaitSync(e,s.SYNC_FLUSH_COMMANDS_BIT,0)){case s.WAIT_FAILED:n();break;case s.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:i()}}setTimeout(r,t)})}function Uh(s){const e=s.elements;e[2]=.5*e[2]+.5*e[3],e[6]=.5*e[6]+.5*e[7],e[10]=.5*e[10]+.5*e[11],e[14]=.5*e[14]+.5*e[15]}function Bh(s){const e=s.elements;e[11]===-1?(e[10]=-e[10]-1,e[14]=-e[14]):(e[10]=-e[10],e[14]=-e[14]+1)}const vo=new Fe().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),yo=new Fe().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Nh(){const s={enabled:!0,workingColorSpace:Dn,spaces:{},convert:function(n,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===tt&&(n.r=xi(n.r),n.g=xi(n.g),n.b=xi(n.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(n.applyMatrix3(this.spaces[r].toXYZ),n.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===tt&&(n.r=wn(n.r),n.g=wn(n.g),n.b=wn(n.b))),n},fromWorkingColorSpace:function(n,r){return this.convert(n,this.workingColorSpace,r)},toWorkingColorSpace:function(n,r){return this.convert(n,r,this.workingColorSpace)},getPrimaries:function(n){return this.spaces[n].primaries},getTransfer:function(n){return n===Ai?Ks:this.spaces[n].transfer},getLuminanceCoefficients:function(n,r=this.workingColorSpace){return n.fromArray(this.spaces[r].luminanceCoefficients)},define:function(n){Object.assign(this.spaces,n)},_getMatrix:function(n,r,a){return n.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(n){return this.spaces[n].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(n=this.workingColorSpace){return this.spaces[n].workingColorSpaceConfig.unpackColorSpace}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],i=[.3127,.329];return s.define({[Dn]:{primaries:e,whitePoint:i,transfer:Ks,toXYZ:vo,fromXYZ:yo,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:Dt},outputColorSpaceConfig:{drawingBufferColorSpace:Dt}},[Dt]:{primaries:e,whitePoint:i,transfer:tt,toXYZ:vo,fromXYZ:yo,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:Dt}}}),s}const Ye=Nh();function xi(s){return s<.04045?s*.0773993808:Math.pow(s*.9478672986+.0521327014,2.4)}function wn(s){return s<.0031308?s*12.92:1.055*Math.pow(s,.41666)-.055}let tn;class Oh{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{tn===void 0&&(tn=ss("canvas")),tn.width=e.width,tn.height=e.height;const i=tn.getContext("2d");e instanceof ImageData?i.putImageData(e,0,0):i.drawImage(e,0,0,e.width,e.height),t=tn}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=ss("canvas");t.width=e.width,t.height=e.height;const i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);const n=i.getImageData(0,0,e.width,e.height),r=n.data;for(let a=0;a<r.length;a++)r[a]=xi(r[a]/255)*255;return i.putImageData(n,0,0),t}else if(e.data){const t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(xi(t[i]/255)*255):t[i]=xi(t[i]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let zh=0;class ic{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:zh++}),this.uuid=yi(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const i={uuid:this.uuid,url:""},n=this.data;if(n!==null){let r;if(Array.isArray(n)){r=[];for(let a=0,o=n.length;a<o;a++)n[a].isDataTexture?r.push(dr(n[a].image)):r.push(dr(n[a]))}else r=dr(n);i.url=r}return t||(e.images[this.uuid]=i),i}}function dr(s){return typeof HTMLImageElement<"u"&&s instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&s instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&s instanceof ImageBitmap?Oh.getDataURL(s):s.data?{data:Array.from(s.data),width:s.width,height:s.height,type:s.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let kh=0;class Mt extends Fn{constructor(e=Mt.DEFAULT_IMAGE,t=Mt.DEFAULT_MAPPING,i=qi,n=qi,r=Ht,a=Pi,o=Zt,l=_i,c=Mt.DEFAULT_ANISOTROPY,h=Ai){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:kh++}),this.uuid=yi(),this.name="",this.source=new ic(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=i,this.wrapT=n,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new Te(0,0),this.repeat=new Te(1,1),this.center=new Te(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Fe,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const i={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),t||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Wl)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case ts:e.x=e.x-Math.floor(e.x);break;case qi:e.x=e.x<0?0:1;break;case sa:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case ts:e.y=e.y-Math.floor(e.y);break;case qi:e.y=e.y<0?0:1;break;case sa:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}Mt.DEFAULT_IMAGE=null;Mt.DEFAULT_MAPPING=Wl;Mt.DEFAULT_ANISOTROPY=1;class it{constructor(e=0,t=0,i=0,n=1){it.prototype.isVector4=!0,this.x=e,this.y=t,this.z=i,this.w=n}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,i,n){return this.x=e,this.y=t,this.z=i,this.w=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,i=this.y,n=this.z,r=this.w,a=e.elements;return this.x=a[0]*t+a[4]*i+a[8]*n+a[12]*r,this.y=a[1]*t+a[5]*i+a[9]*n+a[13]*r,this.z=a[2]*t+a[6]*i+a[10]*n+a[14]*r,this.w=a[3]*t+a[7]*i+a[11]*n+a[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,i,n,r;const l=e.elements,c=l[0],h=l[4],d=l[8],f=l[1],p=l[5],g=l[9],y=l[2],m=l[6],u=l[10];if(Math.abs(h-f)<.01&&Math.abs(d-y)<.01&&Math.abs(g-m)<.01){if(Math.abs(h+f)<.1&&Math.abs(d+y)<.1&&Math.abs(g+m)<.1&&Math.abs(c+p+u-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const _=(c+1)/2,x=(p+1)/2,T=(u+1)/2,C=(h+f)/4,A=(d+y)/4,P=(g+m)/4;return _>x&&_>T?_<.01?(i=0,n=.707106781,r=.707106781):(i=Math.sqrt(_),n=C/i,r=A/i):x>T?x<.01?(i=.707106781,n=0,r=.707106781):(n=Math.sqrt(x),i=C/n,r=P/n):T<.01?(i=.707106781,n=.707106781,r=0):(r=Math.sqrt(T),i=A/r,n=P/r),this.set(i,n,r,t),this}let v=Math.sqrt((m-g)*(m-g)+(d-y)*(d-y)+(f-h)*(f-h));return Math.abs(v)<.001&&(v=1),this.x=(m-g)/v,this.y=(d-y)/v,this.z=(f-h)/v,this.w=Math.acos((c+p+u-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=ke(this.x,e.x,t.x),this.y=ke(this.y,e.y,t.y),this.z=ke(this.z,e.z,t.z),this.w=ke(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=ke(this.x,e,t),this.y=ke(this.y,e,t),this.z=ke(this.z,e,t),this.w=ke(this.w,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(ke(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this.w=e.w+(t.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class Hh extends Fn{constructor(e=1,t=1,i={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new it(0,0,e,t),this.scissorTest=!1,this.viewport=new it(0,0,e,t);const n={width:e,height:t,depth:1};i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Ht,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},i);const r=new Mt(n,i.mapping,i.wrapS,i.wrapT,i.magFilter,i.minFilter,i.format,i.type,i.anisotropy,i.colorSpace);r.flipY=!1,r.generateMipmaps=i.generateMipmaps,r.internalFormat=i.internalFormat,this.textures=[];const a=i.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,i=1){if(this.width!==e||this.height!==t||this.depth!==i){this.width=e,this.height=t,this.depth=i;for(let n=0,r=this.textures.length;n<r;n++)this.textures[n].image.width=e,this.textures[n].image.height=t,this.textures[n].image.depth=i;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let i=0,n=e.textures.length;i<n;i++)this.textures[i]=e.textures[i].clone(),this.textures[i].isRenderTargetTexture=!0,this.textures[i].renderTarget=this;const t=Object.assign({},e.texture.image);return this.texture.source=new ic(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Ki extends Hh{constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}}class nc extends Mt{constructor(e=null,t=1,i=1,n=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:n},this.magFilter=Vt,this.minFilter=Vt,this.wrapR=qi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class Vh extends Mt{constructor(e=null,t=1,i=1,n=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:n},this.magFilter=Vt,this.minFilter=Vt,this.wrapR=qi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Un{constructor(e=0,t=0,i=0,n=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=n}static slerpFlat(e,t,i,n,r,a,o){let l=i[n+0],c=i[n+1],h=i[n+2],d=i[n+3];const f=r[a+0],p=r[a+1],g=r[a+2],y=r[a+3];if(o===0){e[t+0]=l,e[t+1]=c,e[t+2]=h,e[t+3]=d;return}if(o===1){e[t+0]=f,e[t+1]=p,e[t+2]=g,e[t+3]=y;return}if(d!==y||l!==f||c!==p||h!==g){let m=1-o;const u=l*f+c*p+h*g+d*y,v=u>=0?1:-1,_=1-u*u;if(_>Number.EPSILON){const T=Math.sqrt(_),C=Math.atan2(T,u*v);m=Math.sin(m*C)/T,o=Math.sin(o*C)/T}const x=o*v;if(l=l*m+f*x,c=c*m+p*x,h=h*m+g*x,d=d*m+y*x,m===1-o){const T=1/Math.sqrt(l*l+c*c+h*h+d*d);l*=T,c*=T,h*=T,d*=T}}e[t]=l,e[t+1]=c,e[t+2]=h,e[t+3]=d}static multiplyQuaternionsFlat(e,t,i,n,r,a){const o=i[n],l=i[n+1],c=i[n+2],h=i[n+3],d=r[a],f=r[a+1],p=r[a+2],g=r[a+3];return e[t]=o*g+h*d+l*p-c*f,e[t+1]=l*g+h*f+c*d-o*p,e[t+2]=c*g+h*p+o*f-l*d,e[t+3]=h*g-o*d-l*f-c*p,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,n){return this._x=e,this._y=t,this._z=i,this._w=n,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const i=e._x,n=e._y,r=e._z,a=e._order,o=Math.cos,l=Math.sin,c=o(i/2),h=o(n/2),d=o(r/2),f=l(i/2),p=l(n/2),g=l(r/2);switch(a){case"XYZ":this._x=f*h*d+c*p*g,this._y=c*p*d-f*h*g,this._z=c*h*g+f*p*d,this._w=c*h*d-f*p*g;break;case"YXZ":this._x=f*h*d+c*p*g,this._y=c*p*d-f*h*g,this._z=c*h*g-f*p*d,this._w=c*h*d+f*p*g;break;case"ZXY":this._x=f*h*d-c*p*g,this._y=c*p*d+f*h*g,this._z=c*h*g+f*p*d,this._w=c*h*d-f*p*g;break;case"ZYX":this._x=f*h*d-c*p*g,this._y=c*p*d+f*h*g,this._z=c*h*g-f*p*d,this._w=c*h*d+f*p*g;break;case"YZX":this._x=f*h*d+c*p*g,this._y=c*p*d+f*h*g,this._z=c*h*g-f*p*d,this._w=c*h*d-f*p*g;break;case"XZY":this._x=f*h*d-c*p*g,this._y=c*p*d-f*h*g,this._z=c*h*g+f*p*d,this._w=c*h*d+f*p*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const i=t/2,n=Math.sin(i);return this._x=e.x*n,this._y=e.y*n,this._z=e.z*n,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,i=t[0],n=t[4],r=t[8],a=t[1],o=t[5],l=t[9],c=t[2],h=t[6],d=t[10],f=i+o+d;if(f>0){const p=.5/Math.sqrt(f+1);this._w=.25/p,this._x=(h-l)*p,this._y=(r-c)*p,this._z=(a-n)*p}else if(i>o&&i>d){const p=2*Math.sqrt(1+i-o-d);this._w=(h-l)/p,this._x=.25*p,this._y=(n+a)/p,this._z=(r+c)/p}else if(o>d){const p=2*Math.sqrt(1+o-i-d);this._w=(r-c)/p,this._x=(n+a)/p,this._y=.25*p,this._z=(l+h)/p}else{const p=2*Math.sqrt(1+d-i-o);this._w=(a-n)/p,this._x=(r+c)/p,this._y=(l+h)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<Number.EPSILON?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(ke(this.dot(e),-1,1)))}rotateTowards(e,t){const i=this.angleTo(e);if(i===0)return this;const n=Math.min(1,t/i);return this.slerp(e,n),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const i=e._x,n=e._y,r=e._z,a=e._w,o=t._x,l=t._y,c=t._z,h=t._w;return this._x=i*h+a*o+n*c-r*l,this._y=n*h+a*l+r*o-i*c,this._z=r*h+a*c+i*l-n*o,this._w=a*h-i*o-n*l-r*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const i=this._x,n=this._y,r=this._z,a=this._w;let o=a*e._w+i*e._x+n*e._y+r*e._z;if(o<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,o=-o):this.copy(e),o>=1)return this._w=a,this._x=i,this._y=n,this._z=r,this;const l=1-o*o;if(l<=Number.EPSILON){const p=1-t;return this._w=p*a+t*this._w,this._x=p*i+t*this._x,this._y=p*n+t*this._y,this._z=p*r+t*this._z,this.normalize(),this}const c=Math.sqrt(l),h=Math.atan2(c,o),d=Math.sin((1-t)*h)/c,f=Math.sin(t*h)/c;return this._w=a*d+this._w*f,this._x=i*d+this._x*f,this._y=n*d+this._y*f,this._z=r*d+this._z*f,this._onChangeCallback(),this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),i=Math.random(),n=Math.sqrt(1-i),r=Math.sqrt(i);return this.set(n*Math.sin(e),n*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class w{constructor(e=0,t=0,i=0){w.prototype.isVector3=!0,this.x=e,this.y=t,this.z=i}set(e,t,i){return i===void 0&&(i=this.z),this.x=e,this.y=t,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(xo.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(xo.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,i=this.y,n=this.z,r=e.elements;return this.x=r[0]*t+r[3]*i+r[6]*n,this.y=r[1]*t+r[4]*i+r[7]*n,this.z=r[2]*t+r[5]*i+r[8]*n,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,i=this.y,n=this.z,r=e.elements,a=1/(r[3]*t+r[7]*i+r[11]*n+r[15]);return this.x=(r[0]*t+r[4]*i+r[8]*n+r[12])*a,this.y=(r[1]*t+r[5]*i+r[9]*n+r[13])*a,this.z=(r[2]*t+r[6]*i+r[10]*n+r[14])*a,this}applyQuaternion(e){const t=this.x,i=this.y,n=this.z,r=e.x,a=e.y,o=e.z,l=e.w,c=2*(a*n-o*i),h=2*(o*t-r*n),d=2*(r*i-a*t);return this.x=t+l*c+a*d-o*h,this.y=i+l*h+o*c-r*d,this.z=n+l*d+r*h-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,i=this.y,n=this.z,r=e.elements;return this.x=r[0]*t+r[4]*i+r[8]*n,this.y=r[1]*t+r[5]*i+r[9]*n,this.z=r[2]*t+r[6]*i+r[10]*n,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=ke(this.x,e.x,t.x),this.y=ke(this.y,e.y,t.y),this.z=ke(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=ke(this.x,e,t),this.y=ke(this.y,e,t),this.z=ke(this.z,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(ke(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const i=e.x,n=e.y,r=e.z,a=t.x,o=t.y,l=t.z;return this.x=n*l-r*o,this.y=r*a-i*l,this.z=i*o-n*a,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const i=e.dot(this)/t;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return fr.copy(this).projectOnVector(e),this.sub(fr)}reflect(e){return this.sub(fr.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(ke(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y,n=this.z-e.z;return t*t+i*i+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,i){const n=Math.sin(t)*e;return this.x=n*Math.sin(i),this.y=Math.cos(t)*e,this.z=n*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,i){return this.x=e*Math.sin(t),this.y=i,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),n=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=i,this.z=n,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,i=Math.sqrt(1-t*t);return this.x=i*Math.cos(e),this.y=t,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const fr=new w,xo=new Un;class ji{constructor(e=new w(1/0,1/0,1/0),t=new w(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint(Qt.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint(Qt.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const i=Qt.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const i=e.geometry;if(i!==void 0){const r=i.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,Qt):Qt.fromBufferAttribute(r,a),Qt.applyMatrix4(e.matrixWorld),this.expandByPoint(Qt);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),ds.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),ds.copy(i.boundingBox)),ds.applyMatrix4(e.matrixWorld),this.union(ds)}const n=e.children;for(let r=0,a=n.length;r<a;r++)this.expandByObject(n[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Qt),Qt.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(On),fs.subVectors(this.max,On),nn.subVectors(e.a,On),sn.subVectors(e.b,On),rn.subVectors(e.c,On),Si.subVectors(sn,nn),Mi.subVectors(rn,sn),Bi.subVectors(nn,rn);let t=[0,-Si.z,Si.y,0,-Mi.z,Mi.y,0,-Bi.z,Bi.y,Si.z,0,-Si.x,Mi.z,0,-Mi.x,Bi.z,0,-Bi.x,-Si.y,Si.x,0,-Mi.y,Mi.x,0,-Bi.y,Bi.x,0];return!pr(t,nn,sn,rn,fs)||(t=[1,0,0,0,1,0,0,0,1],!pr(t,nn,sn,rn,fs))?!1:(ps.crossVectors(Si,Mi),t=[ps.x,ps.y,ps.z],pr(t,nn,sn,rn,fs))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Qt).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Qt).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(li[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),li[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),li[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),li[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),li[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),li[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),li[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),li[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(li),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}}const li=[new w,new w,new w,new w,new w,new w,new w,new w],Qt=new w,ds=new ji,nn=new w,sn=new w,rn=new w,Si=new w,Mi=new w,Bi=new w,On=new w,fs=new w,ps=new w,Ni=new w;function pr(s,e,t,i,n){for(let r=0,a=s.length-3;r<=a;r+=3){Ni.fromArray(s,r);const o=n.x*Math.abs(Ni.x)+n.y*Math.abs(Ni.y)+n.z*Math.abs(Ni.z),l=e.dot(Ni),c=t.dot(Ni),h=i.dot(Ni);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>o)return!1}return!0}const Gh=new ji,zn=new w,mr=new w;class Qi{constructor(e=new w,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const i=this.center;t!==void 0?i.copy(t):Gh.setFromPoints(e).getCenter(i);let n=0;for(let r=0,a=e.length;r<a;r++)n=Math.max(n,i.distanceToSquared(e[r]));return this.radius=Math.sqrt(n),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;zn.subVectors(e,this.center);const t=zn.lengthSq();if(t>this.radius*this.radius){const i=Math.sqrt(t),n=(i-this.radius)*.5;this.center.addScaledVector(zn,n/i),this.radius+=n}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(mr.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(zn.copy(e.center).add(mr)),this.expandByPoint(zn.copy(e.center).sub(mr))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}}const ci=new w,gr=new w,ms=new w,Ei=new w,vr=new w,gs=new w,yr=new w;class rr{constructor(e=new w,t=new w(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,ci)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=ci.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(ci.copy(this.origin).addScaledVector(this.direction,t),ci.distanceToSquared(e))}distanceSqToSegment(e,t,i,n){gr.copy(e).add(t).multiplyScalar(.5),ms.copy(t).sub(e).normalize(),Ei.copy(this.origin).sub(gr);const r=e.distanceTo(t)*.5,a=-this.direction.dot(ms),o=Ei.dot(this.direction),l=-Ei.dot(ms),c=Ei.lengthSq(),h=Math.abs(1-a*a);let d,f,p,g;if(h>0)if(d=a*l-o,f=a*o-l,g=r*h,d>=0)if(f>=-g)if(f<=g){const y=1/h;d*=y,f*=y,p=d*(d+a*f+2*o)+f*(a*d+f+2*l)+c}else f=r,d=Math.max(0,-(a*f+o)),p=-d*d+f*(f+2*l)+c;else f=-r,d=Math.max(0,-(a*f+o)),p=-d*d+f*(f+2*l)+c;else f<=-g?(d=Math.max(0,-(-a*r+o)),f=d>0?-r:Math.min(Math.max(-r,-l),r),p=-d*d+f*(f+2*l)+c):f<=g?(d=0,f=Math.min(Math.max(-r,-l),r),p=f*(f+2*l)+c):(d=Math.max(0,-(a*r+o)),f=d>0?r:Math.min(Math.max(-r,-l),r),p=-d*d+f*(f+2*l)+c);else f=a>0?-r:r,d=Math.max(0,-(a*f+o)),p=-d*d+f*(f+2*l)+c;return i&&i.copy(this.origin).addScaledVector(this.direction,d),n&&n.copy(gr).addScaledVector(ms,f),p}intersectSphere(e,t){ci.subVectors(e.center,this.origin);const i=ci.dot(this.direction),n=ci.dot(ci)-i*i,r=e.radius*e.radius;if(n>r)return null;const a=Math.sqrt(r-n),o=i-a,l=i+a;return l<0?null:o<0?this.at(l,t):this.at(o,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){const i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,n,r,a,o,l;const c=1/this.direction.x,h=1/this.direction.y,d=1/this.direction.z,f=this.origin;return c>=0?(i=(e.min.x-f.x)*c,n=(e.max.x-f.x)*c):(i=(e.max.x-f.x)*c,n=(e.min.x-f.x)*c),h>=0?(r=(e.min.y-f.y)*h,a=(e.max.y-f.y)*h):(r=(e.max.y-f.y)*h,a=(e.min.y-f.y)*h),i>a||r>n||((r>i||isNaN(i))&&(i=r),(a<n||isNaN(n))&&(n=a),d>=0?(o=(e.min.z-f.z)*d,l=(e.max.z-f.z)*d):(o=(e.max.z-f.z)*d,l=(e.min.z-f.z)*d),i>l||o>n)||((o>i||i!==i)&&(i=o),(l<n||n!==n)&&(n=l),n<0)?null:this.at(i>=0?i:n,t)}intersectsBox(e){return this.intersectBox(e,ci)!==null}intersectTriangle(e,t,i,n,r){vr.subVectors(t,e),gs.subVectors(i,e),yr.crossVectors(vr,gs);let a=this.direction.dot(yr),o;if(a>0){if(n)return null;o=1}else if(a<0)o=-1,a=-a;else return null;Ei.subVectors(this.origin,e);const l=o*this.direction.dot(gs.crossVectors(Ei,gs));if(l<0)return null;const c=o*this.direction.dot(vr.cross(Ei));if(c<0||l+c>a)return null;const h=-o*Ei.dot(yr);return h<0?null:this.at(h/a,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Ke{constructor(e,t,i,n,r,a,o,l,c,h,d,f,p,g,y,m){Ke.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,i,n,r,a,o,l,c,h,d,f,p,g,y,m)}set(e,t,i,n,r,a,o,l,c,h,d,f,p,g,y,m){const u=this.elements;return u[0]=e,u[4]=t,u[8]=i,u[12]=n,u[1]=r,u[5]=a,u[9]=o,u[13]=l,u[2]=c,u[6]=h,u[10]=d,u[14]=f,u[3]=p,u[7]=g,u[11]=y,u[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Ke().fromArray(this.elements)}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],t[9]=i[9],t[10]=i[10],t[11]=i[11],t[12]=i[12],t[13]=i[13],t[14]=i[14],t[15]=i[15],this}copyPosition(e){const t=this.elements,i=e.elements;return t[12]=i[12],t[13]=i[13],t[14]=i[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,i){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this}makeBasis(e,t,i){return this.set(e.x,t.x,i.x,0,e.y,t.y,i.y,0,e.z,t.z,i.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,i=e.elements,n=1/an.setFromMatrixColumn(e,0).length(),r=1/an.setFromMatrixColumn(e,1).length(),a=1/an.setFromMatrixColumn(e,2).length();return t[0]=i[0]*n,t[1]=i[1]*n,t[2]=i[2]*n,t[3]=0,t[4]=i[4]*r,t[5]=i[5]*r,t[6]=i[6]*r,t[7]=0,t[8]=i[8]*a,t[9]=i[9]*a,t[10]=i[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,i=e.x,n=e.y,r=e.z,a=Math.cos(i),o=Math.sin(i),l=Math.cos(n),c=Math.sin(n),h=Math.cos(r),d=Math.sin(r);if(e.order==="XYZ"){const f=a*h,p=a*d,g=o*h,y=o*d;t[0]=l*h,t[4]=-l*d,t[8]=c,t[1]=p+g*c,t[5]=f-y*c,t[9]=-o*l,t[2]=y-f*c,t[6]=g+p*c,t[10]=a*l}else if(e.order==="YXZ"){const f=l*h,p=l*d,g=c*h,y=c*d;t[0]=f+y*o,t[4]=g*o-p,t[8]=a*c,t[1]=a*d,t[5]=a*h,t[9]=-o,t[2]=p*o-g,t[6]=y+f*o,t[10]=a*l}else if(e.order==="ZXY"){const f=l*h,p=l*d,g=c*h,y=c*d;t[0]=f-y*o,t[4]=-a*d,t[8]=g+p*o,t[1]=p+g*o,t[5]=a*h,t[9]=y-f*o,t[2]=-a*c,t[6]=o,t[10]=a*l}else if(e.order==="ZYX"){const f=a*h,p=a*d,g=o*h,y=o*d;t[0]=l*h,t[4]=g*c-p,t[8]=f*c+y,t[1]=l*d,t[5]=y*c+f,t[9]=p*c-g,t[2]=-c,t[6]=o*l,t[10]=a*l}else if(e.order==="YZX"){const f=a*l,p=a*c,g=o*l,y=o*c;t[0]=l*h,t[4]=y-f*d,t[8]=g*d+p,t[1]=d,t[5]=a*h,t[9]=-o*h,t[2]=-c*h,t[6]=p*d+g,t[10]=f-y*d}else if(e.order==="XZY"){const f=a*l,p=a*c,g=o*l,y=o*c;t[0]=l*h,t[4]=-d,t[8]=c*h,t[1]=f*d+y,t[5]=a*h,t[9]=p*d-g,t[2]=g*d-p,t[6]=o*h,t[10]=y*d+f}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Wh,e,Xh)}lookAt(e,t,i){const n=this.elements;return Nt.subVectors(e,t),Nt.lengthSq()===0&&(Nt.z=1),Nt.normalize(),wi.crossVectors(i,Nt),wi.lengthSq()===0&&(Math.abs(i.z)===1?Nt.x+=1e-4:Nt.z+=1e-4,Nt.normalize(),wi.crossVectors(i,Nt)),wi.normalize(),vs.crossVectors(Nt,wi),n[0]=wi.x,n[4]=vs.x,n[8]=Nt.x,n[1]=wi.y,n[5]=vs.y,n[9]=Nt.y,n[2]=wi.z,n[6]=vs.z,n[10]=Nt.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,n=t.elements,r=this.elements,a=i[0],o=i[4],l=i[8],c=i[12],h=i[1],d=i[5],f=i[9],p=i[13],g=i[2],y=i[6],m=i[10],u=i[14],v=i[3],_=i[7],x=i[11],T=i[15],C=n[0],A=n[4],P=n[8],M=n[12],S=n[1],I=n[5],F=n[9],N=n[13],W=n[2],$=n[6],X=n[10],j=n[14],G=n[3],ae=n[7],de=n[11],_e=n[15];return r[0]=a*C+o*S+l*W+c*G,r[4]=a*A+o*I+l*$+c*ae,r[8]=a*P+o*F+l*X+c*de,r[12]=a*M+o*N+l*j+c*_e,r[1]=h*C+d*S+f*W+p*G,r[5]=h*A+d*I+f*$+p*ae,r[9]=h*P+d*F+f*X+p*de,r[13]=h*M+d*N+f*j+p*_e,r[2]=g*C+y*S+m*W+u*G,r[6]=g*A+y*I+m*$+u*ae,r[10]=g*P+y*F+m*X+u*de,r[14]=g*M+y*N+m*j+u*_e,r[3]=v*C+_*S+x*W+T*G,r[7]=v*A+_*I+x*$+T*ae,r[11]=v*P+_*F+x*X+T*de,r[15]=v*M+_*N+x*j+T*_e,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[4],n=e[8],r=e[12],a=e[1],o=e[5],l=e[9],c=e[13],h=e[2],d=e[6],f=e[10],p=e[14],g=e[3],y=e[7],m=e[11],u=e[15];return g*(+r*l*d-n*c*d-r*o*f+i*c*f+n*o*p-i*l*p)+y*(+t*l*p-t*c*f+r*a*f-n*a*p+n*c*h-r*l*h)+m*(+t*c*d-t*o*p-r*a*d+i*a*p+r*o*h-i*c*h)+u*(-n*o*h-t*l*d+t*o*f+n*a*d-i*a*f+i*l*h)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,i){const n=this.elements;return e.isVector3?(n[12]=e.x,n[13]=e.y,n[14]=e.z):(n[12]=e,n[13]=t,n[14]=i),this}invert(){const e=this.elements,t=e[0],i=e[1],n=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8],d=e[9],f=e[10],p=e[11],g=e[12],y=e[13],m=e[14],u=e[15],v=d*m*c-y*f*c+y*l*p-o*m*p-d*l*u+o*f*u,_=g*f*c-h*m*c-g*l*p+a*m*p+h*l*u-a*f*u,x=h*y*c-g*d*c+g*o*p-a*y*p-h*o*u+a*d*u,T=g*d*l-h*y*l-g*o*f+a*y*f+h*o*m-a*d*m,C=t*v+i*_+n*x+r*T;if(C===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const A=1/C;return e[0]=v*A,e[1]=(y*f*r-d*m*r-y*n*p+i*m*p+d*n*u-i*f*u)*A,e[2]=(o*m*r-y*l*r+y*n*c-i*m*c-o*n*u+i*l*u)*A,e[3]=(d*l*r-o*f*r-d*n*c+i*f*c+o*n*p-i*l*p)*A,e[4]=_*A,e[5]=(h*m*r-g*f*r+g*n*p-t*m*p-h*n*u+t*f*u)*A,e[6]=(g*l*r-a*m*r-g*n*c+t*m*c+a*n*u-t*l*u)*A,e[7]=(a*f*r-h*l*r+h*n*c-t*f*c-a*n*p+t*l*p)*A,e[8]=x*A,e[9]=(g*d*r-h*y*r-g*i*p+t*y*p+h*i*u-t*d*u)*A,e[10]=(a*y*r-g*o*r+g*i*c-t*y*c-a*i*u+t*o*u)*A,e[11]=(h*o*r-a*d*r-h*i*c+t*d*c+a*i*p-t*o*p)*A,e[12]=T*A,e[13]=(h*y*n-g*d*n+g*i*f-t*y*f-h*i*m+t*d*m)*A,e[14]=(g*o*n-a*y*n-g*i*l+t*y*l+a*i*m-t*o*m)*A,e[15]=(a*d*n-h*o*n+h*i*l-t*d*l-a*i*f+t*o*f)*A,this}scale(e){const t=this.elements,i=e.x,n=e.y,r=e.z;return t[0]*=i,t[4]*=n,t[8]*=r,t[1]*=i,t[5]*=n,t[9]*=r,t[2]*=i,t[6]*=n,t[10]*=r,t[3]*=i,t[7]*=n,t[11]*=r,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],n=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,i,n))}makeTranslation(e,t,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,i,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,t,-i,0,0,i,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,0,i,0,0,1,0,0,-i,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,0,i,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const i=Math.cos(t),n=Math.sin(t),r=1-i,a=e.x,o=e.y,l=e.z,c=r*a,h=r*o;return this.set(c*a+i,c*o-n*l,c*l+n*o,0,c*o+n*l,h*o+i,h*l-n*a,0,c*l-n*o,h*l+n*a,r*l*l+i,0,0,0,0,1),this}makeScale(e,t,i){return this.set(e,0,0,0,0,t,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,t,i,n,r,a){return this.set(1,i,r,0,e,1,a,0,t,n,1,0,0,0,0,1),this}compose(e,t,i){const n=this.elements,r=t._x,a=t._y,o=t._z,l=t._w,c=r+r,h=a+a,d=o+o,f=r*c,p=r*h,g=r*d,y=a*h,m=a*d,u=o*d,v=l*c,_=l*h,x=l*d,T=i.x,C=i.y,A=i.z;return n[0]=(1-(y+u))*T,n[1]=(p+x)*T,n[2]=(g-_)*T,n[3]=0,n[4]=(p-x)*C,n[5]=(1-(f+u))*C,n[6]=(m+v)*C,n[7]=0,n[8]=(g+_)*A,n[9]=(m-v)*A,n[10]=(1-(f+y))*A,n[11]=0,n[12]=e.x,n[13]=e.y,n[14]=e.z,n[15]=1,this}decompose(e,t,i){const n=this.elements;let r=an.set(n[0],n[1],n[2]).length();const a=an.set(n[4],n[5],n[6]).length(),o=an.set(n[8],n[9],n[10]).length();this.determinant()<0&&(r=-r),e.x=n[12],e.y=n[13],e.z=n[14],Jt.copy(this);const c=1/r,h=1/a,d=1/o;return Jt.elements[0]*=c,Jt.elements[1]*=c,Jt.elements[2]*=c,Jt.elements[4]*=h,Jt.elements[5]*=h,Jt.elements[6]*=h,Jt.elements[8]*=d,Jt.elements[9]*=d,Jt.elements[10]*=d,t.setFromRotationMatrix(Jt),i.x=r,i.y=a,i.z=o,this}makePerspective(e,t,i,n,r,a,o=mi){const l=this.elements,c=2*r/(t-e),h=2*r/(i-n),d=(t+e)/(t-e),f=(i+n)/(i-n);let p,g;if(o===mi)p=-(a+r)/(a-r),g=-2*a*r/(a-r);else if(o===js)p=-a/(a-r),g=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return l[0]=c,l[4]=0,l[8]=d,l[12]=0,l[1]=0,l[5]=h,l[9]=f,l[13]=0,l[2]=0,l[6]=0,l[10]=p,l[14]=g,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,i,n,r,a,o=mi){const l=this.elements,c=1/(t-e),h=1/(i-n),d=1/(a-r),f=(t+e)*c,p=(i+n)*h;let g,y;if(o===mi)g=(a+r)*d,y=-2*d;else if(o===js)g=r*d,y=-1*d;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-f,l[1]=0,l[5]=2*h,l[9]=0,l[13]=-p,l[2]=0,l[6]=0,l[10]=y,l[14]=-g,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){const t=this.elements,i=e.elements;for(let n=0;n<16;n++)if(t[n]!==i[n])return!1;return!0}fromArray(e,t=0){for(let i=0;i<16;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e[t+9]=i[9],e[t+10]=i[10],e[t+11]=i[11],e[t+12]=i[12],e[t+13]=i[13],e[t+14]=i[14],e[t+15]=i[15],e}}const an=new w,Jt=new Ke,Wh=new w(0,0,0),Xh=new w(1,1,1),wi=new w,vs=new w,Nt=new w,_o=new Ke,bo=new Un;class ni{constructor(e=0,t=0,i=0,n=ni.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=i,this._order=n}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,i,n=this._order){return this._x=e,this._y=t,this._z=i,this._order=n,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,i=!0){const n=e.elements,r=n[0],a=n[4],o=n[8],l=n[1],c=n[5],h=n[9],d=n[2],f=n[6],p=n[10];switch(t){case"XYZ":this._y=Math.asin(ke(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,p),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(f,c),this._z=0);break;case"YXZ":this._x=Math.asin(-ke(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,p),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-d,r),this._z=0);break;case"ZXY":this._x=Math.asin(ke(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(-d,p),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-ke(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(f,p),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(ke(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-d,r)):(this._x=0,this._y=Math.atan2(o,p));break;case"XZY":this._z=Math.asin(-ke(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(f,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-h,p),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,i){return _o.makeRotationFromQuaternion(e),this.setFromRotationMatrix(_o,t,i)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return bo.setFromEuler(this),this.setFromQuaternion(bo,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}ni.DEFAULT_ORDER="XYZ";class $a{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let qh=0;const So=new w,on=new Un,hi=new Ke,ys=new w,kn=new w,$h=new w,Yh=new Un,Mo=new w(1,0,0),Eo=new w(0,1,0),wo=new w(0,0,1),To={type:"added"},Zh={type:"removed"},ln={type:"childadded",child:null},xr={type:"childremoved",child:null};class bt extends Fn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:qh++}),this.uuid=yi(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=bt.DEFAULT_UP.clone();const e=new w,t=new ni,i=new Un,n=new w(1,1,1);function r(){i.setFromEuler(t,!1)}function a(){t.setFromQuaternion(i,void 0,!1)}t._onChange(r),i._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:n},modelViewMatrix:{value:new Ke},normalMatrix:{value:new Fe}}),this.matrix=new Ke,this.matrixWorld=new Ke,this.matrixAutoUpdate=bt.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=bt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new $a,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return on.setFromAxisAngle(e,t),this.quaternion.multiply(on),this}rotateOnWorldAxis(e,t){return on.setFromAxisAngle(e,t),this.quaternion.premultiply(on),this}rotateX(e){return this.rotateOnAxis(Mo,e)}rotateY(e){return this.rotateOnAxis(Eo,e)}rotateZ(e){return this.rotateOnAxis(wo,e)}translateOnAxis(e,t){return So.copy(e).applyQuaternion(this.quaternion),this.position.add(So.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Mo,e)}translateY(e){return this.translateOnAxis(Eo,e)}translateZ(e){return this.translateOnAxis(wo,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(hi.copy(this.matrixWorld).invert())}lookAt(e,t,i){e.isVector3?ys.copy(e):ys.set(e,t,i);const n=this.parent;this.updateWorldMatrix(!0,!1),kn.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?hi.lookAt(kn,ys,this.up):hi.lookAt(ys,kn,this.up),this.quaternion.setFromRotationMatrix(hi),n&&(hi.extractRotation(n.matrixWorld),on.setFromRotationMatrix(hi),this.quaternion.premultiply(on.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(To),ln.child=e,this.dispatchEvent(ln),ln.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Zh),xr.child=e,this.dispatchEvent(xr),xr.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),hi.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),hi.multiply(e.parent.matrixWorld)),e.applyMatrix4(hi),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(To),ln.child=e,this.dispatchEvent(ln),ln.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let i=0,n=this.children.length;i<n;i++){const a=this.children[i].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,i=[]){this[e]===t&&i.push(this);const n=this.children;for(let r=0,a=n.length;r<a;r++)n[r].getObjectsByProperty(e,t,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(kn,e,$h),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(kn,Yh,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let i=0,n=t.length;i<n;i++)t[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let i=0,n=t.length;i<n;i++)t[i].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let i=0,n=t.length;i<n;i++)t[i].updateMatrixWorld(e)}updateWorldMatrix(e,t){const i=this.parent;if(e===!0&&i!==null&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const n=this.children;for(let r=0,a=n.length;r<a;r++)n[r].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",i={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const n={};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.castShadow===!0&&(n.castShadow=!0),this.receiveShadow===!0&&(n.receiveShadow=!0),this.visible===!1&&(n.visible=!1),this.frustumCulled===!1&&(n.frustumCulled=!1),this.renderOrder!==0&&(n.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(n.userData=this.userData),n.layers=this.layers.mask,n.matrix=this.matrix.toArray(),n.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(n.matrixAutoUpdate=!1),this.isInstancedMesh&&(n.type="InstancedMesh",n.count=this.count,n.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(n.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(n.type="BatchedMesh",n.perObjectFrustumCulled=this.perObjectFrustumCulled,n.sortObjects=this.sortObjects,n.drawRanges=this._drawRanges,n.reservedRanges=this._reservedRanges,n.visibility=this._visibility,n.active=this._active,n.bounds=this._bounds.map(o=>({boxInitialized:o.boxInitialized,boxMin:o.box.min.toArray(),boxMax:o.box.max.toArray(),sphereInitialized:o.sphereInitialized,sphereRadius:o.sphere.radius,sphereCenter:o.sphere.center.toArray()})),n.maxInstanceCount=this._maxInstanceCount,n.maxVertexCount=this._maxVertexCount,n.maxIndexCount=this._maxIndexCount,n.geometryInitialized=this._geometryInitialized,n.geometryCount=this._geometryCount,n.matricesTexture=this._matricesTexture.toJSON(e),this._colorsTexture!==null&&(n.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(n.boundingSphere={center:n.boundingSphere.center.toArray(),radius:n.boundingSphere.radius}),this.boundingBox!==null&&(n.boundingBox={min:n.boundingBox.min.toArray(),max:n.boundingBox.max.toArray()}));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?n.background=this.background.toJSON():this.background.isTexture&&(n.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(n.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){n.geometry=r(e.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const l=o.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){const d=l[c];r(e.shapes,d)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(n.bindMode=this.bindMode,n.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),n.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(e.materials,this.material[l]));n.material=o}else n.material=r(e.materials,this.material);if(this.children.length>0){n.children=[];for(let o=0;o<this.children.length;o++)n.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){n.animations=[];for(let o=0;o<this.animations.length;o++){const l=this.animations[o];n.animations.push(r(e.animations,l))}}if(t){const o=a(e.geometries),l=a(e.materials),c=a(e.textures),h=a(e.images),d=a(e.shapes),f=a(e.skeletons),p=a(e.animations),g=a(e.nodes);o.length>0&&(i.geometries=o),l.length>0&&(i.materials=l),c.length>0&&(i.textures=c),h.length>0&&(i.images=h),d.length>0&&(i.shapes=d),f.length>0&&(i.skeletons=f),p.length>0&&(i.animations=p),g.length>0&&(i.nodes=g)}return i.object=n,i;function a(o){const l=[];for(const c in o){const h=o[c];delete h.metadata,l.push(h)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let i=0;i<e.children.length;i++){const n=e.children[i];this.add(n.clone())}return this}}bt.DEFAULT_UP=new w(0,1,0);bt.DEFAULT_MATRIX_AUTO_UPDATE=!0;bt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const ei=new w,ui=new w,_r=new w,di=new w,cn=new w,hn=new w,Ro=new w,br=new w,Sr=new w,Mr=new w,Er=new it,wr=new it,Tr=new it;class Yt{constructor(e=new w,t=new w,i=new w){this.a=e,this.b=t,this.c=i}static getNormal(e,t,i,n){n.subVectors(i,t),ei.subVectors(e,t),n.cross(ei);const r=n.lengthSq();return r>0?n.multiplyScalar(1/Math.sqrt(r)):n.set(0,0,0)}static getBarycoord(e,t,i,n,r){ei.subVectors(n,t),ui.subVectors(i,t),_r.subVectors(e,t);const a=ei.dot(ei),o=ei.dot(ui),l=ei.dot(_r),c=ui.dot(ui),h=ui.dot(_r),d=a*c-o*o;if(d===0)return r.set(0,0,0),null;const f=1/d,p=(c*l-o*h)*f,g=(a*h-o*l)*f;return r.set(1-p-g,g,p)}static containsPoint(e,t,i,n){return this.getBarycoord(e,t,i,n,di)===null?!1:di.x>=0&&di.y>=0&&di.x+di.y<=1}static getInterpolation(e,t,i,n,r,a,o,l){return this.getBarycoord(e,t,i,n,di)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,di.x),l.addScaledVector(a,di.y),l.addScaledVector(o,di.z),l)}static getInterpolatedAttribute(e,t,i,n,r,a){return Er.setScalar(0),wr.setScalar(0),Tr.setScalar(0),Er.fromBufferAttribute(e,t),wr.fromBufferAttribute(e,i),Tr.fromBufferAttribute(e,n),a.setScalar(0),a.addScaledVector(Er,r.x),a.addScaledVector(wr,r.y),a.addScaledVector(Tr,r.z),a}static isFrontFacing(e,t,i,n){return ei.subVectors(i,t),ui.subVectors(e,t),ei.cross(ui).dot(n)<0}set(e,t,i){return this.a.copy(e),this.b.copy(t),this.c.copy(i),this}setFromPointsAndIndices(e,t,i,n){return this.a.copy(e[t]),this.b.copy(e[i]),this.c.copy(e[n]),this}setFromAttributeAndIndices(e,t,i,n){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,n),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return ei.subVectors(this.c,this.b),ui.subVectors(this.a,this.b),ei.cross(ui).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return Yt.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return Yt.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,i,n,r){return Yt.getInterpolation(e,this.a,this.b,this.c,t,i,n,r)}containsPoint(e){return Yt.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return Yt.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const i=this.a,n=this.b,r=this.c;let a,o;cn.subVectors(n,i),hn.subVectors(r,i),br.subVectors(e,i);const l=cn.dot(br),c=hn.dot(br);if(l<=0&&c<=0)return t.copy(i);Sr.subVectors(e,n);const h=cn.dot(Sr),d=hn.dot(Sr);if(h>=0&&d<=h)return t.copy(n);const f=l*d-h*c;if(f<=0&&l>=0&&h<=0)return a=l/(l-h),t.copy(i).addScaledVector(cn,a);Mr.subVectors(e,r);const p=cn.dot(Mr),g=hn.dot(Mr);if(g>=0&&p<=g)return t.copy(r);const y=p*c-l*g;if(y<=0&&c>=0&&g<=0)return o=c/(c-g),t.copy(i).addScaledVector(hn,o);const m=h*g-p*d;if(m<=0&&d-h>=0&&p-g>=0)return Ro.subVectors(r,n),o=(d-h)/(d-h+(p-g)),t.copy(n).addScaledVector(Ro,o);const u=1/(m+y+f);return a=y*u,o=f*u,t.copy(i).addScaledVector(cn,a).addScaledVector(hn,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const sc={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Ti={h:0,s:0,l:0},xs={h:0,s:0,l:0};function Rr(s,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?s+(e-s)*6*t:t<1/2?e:t<2/3?s+(e-s)*6*(2/3-t):s}class Ae{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){const n=e;n&&n.isColor?this.copy(n):typeof n=="number"?this.setHex(n):typeof n=="string"&&this.setStyle(n)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Dt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Ye.toWorkingColorSpace(this,t),this}setRGB(e,t,i,n=Ye.workingColorSpace){return this.r=e,this.g=t,this.b=i,Ye.toWorkingColorSpace(this,n),this}setHSL(e,t,i,n=Ye.workingColorSpace){if(e=qa(e,1),t=ke(t,0,1),i=ke(i,0,1),t===0)this.r=this.g=this.b=i;else{const r=i<=.5?i*(1+t):i+t-i*t,a=2*i-r;this.r=Rr(a,r,e+1/3),this.g=Rr(a,r,e),this.b=Rr(a,r,e-1/3)}return Ye.toWorkingColorSpace(this,n),this}setStyle(e,t=Dt){function i(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let n;if(n=/^(\w+)\(([^\)]*)\)/.exec(e)){let r;const a=n[1],o=n[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(n=/^\#([A-Fa-f\d]+)$/.exec(e)){const r=n[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(r,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Dt){const i=sc[e.toLowerCase()];return i!==void 0?this.setHex(i,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=xi(e.r),this.g=xi(e.g),this.b=xi(e.b),this}copyLinearToSRGB(e){return this.r=wn(e.r),this.g=wn(e.g),this.b=wn(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Dt){return Ye.fromWorkingColorSpace(Tt.copy(this),e),Math.round(ke(Tt.r*255,0,255))*65536+Math.round(ke(Tt.g*255,0,255))*256+Math.round(ke(Tt.b*255,0,255))}getHexString(e=Dt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Ye.workingColorSpace){Ye.fromWorkingColorSpace(Tt.copy(this),t);const i=Tt.r,n=Tt.g,r=Tt.b,a=Math.max(i,n,r),o=Math.min(i,n,r);let l,c;const h=(o+a)/2;if(o===a)l=0,c=0;else{const d=a-o;switch(c=h<=.5?d/(a+o):d/(2-a-o),a){case i:l=(n-r)/d+(n<r?6:0);break;case n:l=(r-i)/d+2;break;case r:l=(i-n)/d+4;break}l/=6}return e.h=l,e.s=c,e.l=h,e}getRGB(e,t=Ye.workingColorSpace){return Ye.fromWorkingColorSpace(Tt.copy(this),t),e.r=Tt.r,e.g=Tt.g,e.b=Tt.b,e}getStyle(e=Dt){Ye.fromWorkingColorSpace(Tt.copy(this),e);const t=Tt.r,i=Tt.g,n=Tt.b;return e!==Dt?`color(${e} ${t.toFixed(3)} ${i.toFixed(3)} ${n.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(i*255)},${Math.round(n*255)})`}offsetHSL(e,t,i){return this.getHSL(Ti),this.setHSL(Ti.h+e,Ti.s+t,Ti.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(Ti),e.getHSL(xs);const i=Jn(Ti.h,xs.h,t),n=Jn(Ti.s,xs.s,t),r=Jn(Ti.l,xs.l,t);return this.setHSL(i,n,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,i=this.g,n=this.b,r=e.elements;return this.r=r[0]*t+r[3]*i+r[6]*n,this.g=r[1]*t+r[4]*i+r[7]*n,this.b=r[2]*t+r[5]*i+r[8]*n,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Tt=new Ae;Ae.NAMES=sc;let Kh=0;class bi extends Fn{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Kh++}),this.uuid=yi(),this.name="",this.type="Material",this.blending=vi,this.side=Li,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=$r,this.blendDst=Yr,this.blendEquation=Wi,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ae(0,0,0),this.blendAlpha=0,this.depthFunc=Rn,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=uo,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=en,this.stencilZFail=en,this.stencilZPass=en,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const i=e[t];if(i===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const n=this[t];if(n===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}n&&n.isColor?n.set(i):n&&n.isVector3&&i&&i.isVector3?n.copy(i):this[t]=i}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const i={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==vi&&(i.blending=this.blending),this.side!==Li&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==$r&&(i.blendSrc=this.blendSrc),this.blendDst!==Yr&&(i.blendDst=this.blendDst),this.blendEquation!==Wi&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==Rn&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==uo&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==en&&(i.stencilFail=this.stencilFail),this.stencilZFail!==en&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==en&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function n(r){const a=[];for(const o in r){const l=r[o];delete l.metadata,a.push(l)}return a}if(t){const r=n(e.textures),a=n(e.images);r.length>0&&(i.textures=r),a.length>0&&(i.images=a)}return i}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let i=null;if(t!==null){const n=t.length;i=new Array(n);for(let r=0;r!==n;++r)i[r]=t[r].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class Tn extends bi{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ae(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new ni,this.combine=Na,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const gt=new w,_s=new Te;class lt{constructor(e,t,i=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=Ia,this.updateRanges=[],this.gpuType=ai,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let n=0,r=this.itemSize;n<r;n++)this.array[e+n]=t.array[i+n];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)_s.fromBufferAttribute(this,t),_s.applyMatrix3(e),this.setXY(t,_s.x,_s.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)gt.fromBufferAttribute(this,t),gt.applyMatrix3(e),this.setXYZ(t,gt.x,gt.y,gt.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)gt.fromBufferAttribute(this,t),gt.applyMatrix4(e),this.setXYZ(t,gt.x,gt.y,gt.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)gt.fromBufferAttribute(this,t),gt.applyNormalMatrix(e),this.setXYZ(t,gt.x,gt.y,gt.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)gt.fromBufferAttribute(this,t),gt.transformDirection(e),this.setXYZ(t,gt.x,gt.y,gt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=ii(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=et(i,this.array)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=ii(t,this.array)),t}setX(e,t){return this.normalized&&(t=et(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=ii(t,this.array)),t}setY(e,t){return this.normalized&&(t=et(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=ii(t,this.array)),t}setZ(e,t){return this.normalized&&(t=et(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=ii(t,this.array)),t}setW(e,t){return this.normalized&&(t=et(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=et(t,this.array),i=et(i,this.array)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,n){return e*=this.itemSize,this.normalized&&(t=et(t,this.array),i=et(i,this.array),n=et(n,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=n,this}setXYZW(e,t,i,n,r){return e*=this.itemSize,this.normalized&&(t=et(t,this.array),i=et(i,this.array),n=et(n,this.array),r=et(r,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=n,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Ia&&(e.usage=this.usage),e}}class rc extends lt{constructor(e,t,i){super(new Uint16Array(e),t,i)}}class ac extends lt{constructor(e,t,i){super(new Uint32Array(e),t,i)}}class ft extends lt{constructor(e,t,i){super(new Float32Array(e),t,i)}}let jh=0;const qt=new Ke,Cr=new bt,un=new w,Ot=new ji,Hn=new ji,_t=new w;class vt extends Fn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:jh++}),this.uuid=yi(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(tc(e)?ac:rc)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,i=0){this.groups.push({start:e,count:t,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const i=this.attributes.normal;if(i!==void 0){const r=new Fe().getNormalMatrix(e);i.applyNormalMatrix(r),i.needsUpdate=!0}const n=this.attributes.tangent;return n!==void 0&&(n.transformDirection(e),n.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return qt.makeRotationFromQuaternion(e),this.applyMatrix4(qt),this}rotateX(e){return qt.makeRotationX(e),this.applyMatrix4(qt),this}rotateY(e){return qt.makeRotationY(e),this.applyMatrix4(qt),this}rotateZ(e){return qt.makeRotationZ(e),this.applyMatrix4(qt),this}translate(e,t,i){return qt.makeTranslation(e,t,i),this.applyMatrix4(qt),this}scale(e,t,i){return qt.makeScale(e,t,i),this.applyMatrix4(qt),this}lookAt(e){return Cr.lookAt(e),Cr.updateMatrix(),this.applyMatrix4(Cr.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(un).negate(),this.translate(un.x,un.y,un.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const i=[];for(let n=0,r=e.length;n<r;n++){const a=e[n];i.push(a.x,a.y,a.z||0)}this.setAttribute("position",new ft(i,3))}else{const i=Math.min(e.length,t.count);for(let n=0;n<i;n++){const r=e[n];t.setXYZ(n,r.x,r.y,r.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new ji);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new w(-1/0,-1/0,-1/0),new w(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let i=0,n=t.length;i<n;i++){const r=t[i];Ot.setFromBufferAttribute(r),this.morphTargetsRelative?(_t.addVectors(this.boundingBox.min,Ot.min),this.boundingBox.expandByPoint(_t),_t.addVectors(this.boundingBox.max,Ot.max),this.boundingBox.expandByPoint(_t)):(this.boundingBox.expandByPoint(Ot.min),this.boundingBox.expandByPoint(Ot.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Qi);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new w,1/0);return}if(e){const i=this.boundingSphere.center;if(Ot.setFromBufferAttribute(e),t)for(let r=0,a=t.length;r<a;r++){const o=t[r];Hn.setFromBufferAttribute(o),this.morphTargetsRelative?(_t.addVectors(Ot.min,Hn.min),Ot.expandByPoint(_t),_t.addVectors(Ot.max,Hn.max),Ot.expandByPoint(_t)):(Ot.expandByPoint(Hn.min),Ot.expandByPoint(Hn.max))}Ot.getCenter(i);let n=0;for(let r=0,a=e.count;r<a;r++)_t.fromBufferAttribute(e,r),n=Math.max(n,i.distanceToSquared(_t));if(t)for(let r=0,a=t.length;r<a;r++){const o=t[r],l=this.morphTargetsRelative;for(let c=0,h=o.count;c<h;c++)_t.fromBufferAttribute(o,c),l&&(un.fromBufferAttribute(e,c),_t.add(un)),n=Math.max(n,i.distanceToSquared(_t))}this.boundingSphere.radius=Math.sqrt(n),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const i=t.position,n=t.normal,r=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new lt(new Float32Array(4*i.count),4));const a=this.getAttribute("tangent"),o=[],l=[];for(let P=0;P<i.count;P++)o[P]=new w,l[P]=new w;const c=new w,h=new w,d=new w,f=new Te,p=new Te,g=new Te,y=new w,m=new w;function u(P,M,S){c.fromBufferAttribute(i,P),h.fromBufferAttribute(i,M),d.fromBufferAttribute(i,S),f.fromBufferAttribute(r,P),p.fromBufferAttribute(r,M),g.fromBufferAttribute(r,S),h.sub(c),d.sub(c),p.sub(f),g.sub(f);const I=1/(p.x*g.y-g.x*p.y);isFinite(I)&&(y.copy(h).multiplyScalar(g.y).addScaledVector(d,-p.y).multiplyScalar(I),m.copy(d).multiplyScalar(p.x).addScaledVector(h,-g.x).multiplyScalar(I),o[P].add(y),o[M].add(y),o[S].add(y),l[P].add(m),l[M].add(m),l[S].add(m))}let v=this.groups;v.length===0&&(v=[{start:0,count:e.count}]);for(let P=0,M=v.length;P<M;++P){const S=v[P],I=S.start,F=S.count;for(let N=I,W=I+F;N<W;N+=3)u(e.getX(N+0),e.getX(N+1),e.getX(N+2))}const _=new w,x=new w,T=new w,C=new w;function A(P){T.fromBufferAttribute(n,P),C.copy(T);const M=o[P];_.copy(M),_.sub(T.multiplyScalar(T.dot(M))).normalize(),x.crossVectors(C,M);const I=x.dot(l[P])<0?-1:1;a.setXYZW(P,_.x,_.y,_.z,I)}for(let P=0,M=v.length;P<M;++P){const S=v[P],I=S.start,F=S.count;for(let N=I,W=I+F;N<W;N+=3)A(e.getX(N+0)),A(e.getX(N+1)),A(e.getX(N+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let i=this.getAttribute("normal");if(i===void 0)i=new lt(new Float32Array(t.count*3),3),this.setAttribute("normal",i);else for(let f=0,p=i.count;f<p;f++)i.setXYZ(f,0,0,0);const n=new w,r=new w,a=new w,o=new w,l=new w,c=new w,h=new w,d=new w;if(e)for(let f=0,p=e.count;f<p;f+=3){const g=e.getX(f+0),y=e.getX(f+1),m=e.getX(f+2);n.fromBufferAttribute(t,g),r.fromBufferAttribute(t,y),a.fromBufferAttribute(t,m),h.subVectors(a,r),d.subVectors(n,r),h.cross(d),o.fromBufferAttribute(i,g),l.fromBufferAttribute(i,y),c.fromBufferAttribute(i,m),o.add(h),l.add(h),c.add(h),i.setXYZ(g,o.x,o.y,o.z),i.setXYZ(y,l.x,l.y,l.z),i.setXYZ(m,c.x,c.y,c.z)}else for(let f=0,p=t.count;f<p;f+=3)n.fromBufferAttribute(t,f+0),r.fromBufferAttribute(t,f+1),a.fromBufferAttribute(t,f+2),h.subVectors(a,r),d.subVectors(n,r),h.cross(d),i.setXYZ(f+0,h.x,h.y,h.z),i.setXYZ(f+1,h.x,h.y,h.z),i.setXYZ(f+2,h.x,h.y,h.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,i=e.count;t<i;t++)_t.fromBufferAttribute(e,t),_t.normalize(),e.setXYZ(t,_t.x,_t.y,_t.z)}toNonIndexed(){function e(o,l){const c=o.array,h=o.itemSize,d=o.normalized,f=new c.constructor(l.length*h);let p=0,g=0;for(let y=0,m=l.length;y<m;y++){o.isInterleavedBufferAttribute?p=l[y]*o.data.stride+o.offset:p=l[y]*h;for(let u=0;u<h;u++)f[g++]=c[p++]}return new lt(f,h,d)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new vt,i=this.index.array,n=this.attributes;for(const o in n){const l=n[o],c=e(l,i);t.setAttribute(o,c)}const r=this.morphAttributes;for(const o in r){const l=[],c=r[o];for(let h=0,d=c.length;h<d;h++){const f=c[h],p=e(f,i);l.push(p)}t.morphAttributes[o]=l}t.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,l=a.length;o<l;o++){const c=a[o];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){const e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const i=this.attributes;for(const l in i){const c=i[l];e.data.attributes[l]=c.toJSON(e.data)}const n={};let r=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],h=[];for(let d=0,f=c.length;d<f;d++){const p=c[d];h.push(p.toJSON(e.data))}h.length>0&&(n[l]=h,r=!0)}r&&(e.data.morphAttributes=n,e.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(e.data.boundingSphere={center:o.center.toArray(),radius:o.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const i=e.index;i!==null&&this.setIndex(i.clone(t));const n=e.attributes;for(const c in n){const h=n[c];this.setAttribute(c,h.clone(t))}const r=e.morphAttributes;for(const c in r){const h=[],d=r[c];for(let f=0,p=d.length;f<p;f++)h.push(d[f].clone(t));this.morphAttributes[c]=h}this.morphTargetsRelative=e.morphTargetsRelative;const a=e.groups;for(let c=0,h=a.length;c<h;c++){const d=a[c];this.addGroup(d.start,d.count,d.materialIndex)}const o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const Co=new Ke,Oi=new rr,bs=new Qi,Ao=new w,Ss=new w,Ms=new w,Es=new w,Ar=new w,ws=new w,Po=new w,Ts=new w;class at extends bt{constructor(e=new vt,t=new Tn){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const n=t[i[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=n.length;r<a;r++){const o=n[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(e,t){const i=this.geometry,n=i.attributes.position,r=i.morphAttributes.position,a=i.morphTargetsRelative;t.fromBufferAttribute(n,e);const o=this.morphTargetInfluences;if(r&&o){ws.set(0,0,0);for(let l=0,c=r.length;l<c;l++){const h=o[l],d=r[l];h!==0&&(Ar.fromBufferAttribute(d,e),a?ws.addScaledVector(Ar,h):ws.addScaledVector(Ar.sub(t),h))}t.add(ws)}return t}raycast(e,t){const i=this.geometry,n=this.material,r=this.matrixWorld;n!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),bs.copy(i.boundingSphere),bs.applyMatrix4(r),Oi.copy(e.ray).recast(e.near),!(bs.containsPoint(Oi.origin)===!1&&(Oi.intersectSphere(bs,Ao)===null||Oi.origin.distanceToSquared(Ao)>(e.far-e.near)**2))&&(Co.copy(r).invert(),Oi.copy(e.ray).applyMatrix4(Co),!(i.boundingBox!==null&&Oi.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,t,Oi)))}_computeIntersections(e,t,i){let n;const r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,d=r.attributes.normal,f=r.groups,p=r.drawRange;if(o!==null)if(Array.isArray(a))for(let g=0,y=f.length;g<y;g++){const m=f[g],u=a[m.materialIndex],v=Math.max(m.start,p.start),_=Math.min(o.count,Math.min(m.start+m.count,p.start+p.count));for(let x=v,T=_;x<T;x+=3){const C=o.getX(x),A=o.getX(x+1),P=o.getX(x+2);n=Rs(this,u,e,i,c,h,d,C,A,P),n&&(n.faceIndex=Math.floor(x/3),n.face.materialIndex=m.materialIndex,t.push(n))}}else{const g=Math.max(0,p.start),y=Math.min(o.count,p.start+p.count);for(let m=g,u=y;m<u;m+=3){const v=o.getX(m),_=o.getX(m+1),x=o.getX(m+2);n=Rs(this,a,e,i,c,h,d,v,_,x),n&&(n.faceIndex=Math.floor(m/3),t.push(n))}}else if(l!==void 0)if(Array.isArray(a))for(let g=0,y=f.length;g<y;g++){const m=f[g],u=a[m.materialIndex],v=Math.max(m.start,p.start),_=Math.min(l.count,Math.min(m.start+m.count,p.start+p.count));for(let x=v,T=_;x<T;x+=3){const C=x,A=x+1,P=x+2;n=Rs(this,u,e,i,c,h,d,C,A,P),n&&(n.faceIndex=Math.floor(x/3),n.face.materialIndex=m.materialIndex,t.push(n))}}else{const g=Math.max(0,p.start),y=Math.min(l.count,p.start+p.count);for(let m=g,u=y;m<u;m+=3){const v=m,_=m+1,x=m+2;n=Rs(this,a,e,i,c,h,d,v,_,x),n&&(n.faceIndex=Math.floor(m/3),t.push(n))}}}}function Qh(s,e,t,i,n,r,a,o){let l;if(e.side===Ut?l=i.intersectTriangle(a,r,n,!0,o):l=i.intersectTriangle(n,r,a,e.side===Li,o),l===null)return null;Ts.copy(o),Ts.applyMatrix4(s.matrixWorld);const c=t.ray.origin.distanceTo(Ts);return c<t.near||c>t.far?null:{distance:c,point:Ts.clone(),object:s}}function Rs(s,e,t,i,n,r,a,o,l,c){s.getVertexPosition(o,Ss),s.getVertexPosition(l,Ms),s.getVertexPosition(c,Es);const h=Qh(s,e,t,i,Ss,Ms,Es,Po);if(h){const d=new w;Yt.getBarycoord(Po,Ss,Ms,Es,d),n&&(h.uv=Yt.getInterpolatedAttribute(n,o,l,c,d,new Te)),r&&(h.uv1=Yt.getInterpolatedAttribute(r,o,l,c,d,new Te)),a&&(h.normal=Yt.getInterpolatedAttribute(a,o,l,c,d,new w),h.normal.dot(i.direction)>0&&h.normal.multiplyScalar(-1));const f={a:o,b:l,c,normal:new w,materialIndex:0};Yt.getNormal(Ss,Ms,Es,f.normal),h.face=f,h.barycoord=d}return h}class os extends vt{constructor(e=1,t=1,i=1,n=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:i,widthSegments:n,heightSegments:r,depthSegments:a};const o=this;n=Math.floor(n),r=Math.floor(r),a=Math.floor(a);const l=[],c=[],h=[],d=[];let f=0,p=0;g("z","y","x",-1,-1,i,t,e,a,r,0),g("z","y","x",1,-1,i,t,-e,a,r,1),g("x","z","y",1,1,e,i,t,n,a,2),g("x","z","y",1,-1,e,i,-t,n,a,3),g("x","y","z",1,-1,e,t,i,n,r,4),g("x","y","z",-1,-1,e,t,-i,n,r,5),this.setIndex(l),this.setAttribute("position",new ft(c,3)),this.setAttribute("normal",new ft(h,3)),this.setAttribute("uv",new ft(d,2));function g(y,m,u,v,_,x,T,C,A,P,M){const S=x/A,I=T/P,F=x/2,N=T/2,W=C/2,$=A+1,X=P+1;let j=0,G=0;const ae=new w;for(let de=0;de<X;de++){const _e=de*I-N;for(let Ne=0;Ne<$;Ne++){const nt=Ne*S-F;ae[y]=nt*v,ae[m]=_e*_,ae[u]=W,c.push(ae.x,ae.y,ae.z),ae[y]=0,ae[m]=0,ae[u]=C>0?1:-1,h.push(ae.x,ae.y,ae.z),d.push(Ne/A),d.push(1-de/P),j+=1}}for(let de=0;de<P;de++)for(let _e=0;_e<A;_e++){const Ne=f+_e+$*de,nt=f+_e+$*(de+1),Y=f+(_e+1)+$*(de+1),ie=f+(_e+1)+$*de;l.push(Ne,nt,ie),l.push(nt,Y,ie),G+=6}o.addGroup(p,G,M),p+=G,f+=j}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new os(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function Ln(s){const e={};for(const t in s){e[t]={};for(const i in s[t]){const n=s[t][i];n&&(n.isColor||n.isMatrix3||n.isMatrix4||n.isVector2||n.isVector3||n.isVector4||n.isTexture||n.isQuaternion)?n.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][i]=null):e[t][i]=n.clone():Array.isArray(n)?e[t][i]=n.slice():e[t][i]=n}}return e}function It(s){const e={};for(let t=0;t<s.length;t++){const i=Ln(s[t]);for(const n in i)e[n]=i[n]}return e}function Jh(s){const e=[];for(let t=0;t<s.length;t++)e.push(s[t].clone());return e}function oc(s){const e=s.getRenderTarget();return e===null?s.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Ye.workingColorSpace}const eu={clone:Ln,merge:It};var tu=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,iu=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class dt extends bi{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=tu,this.fragmentShader=iu,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Ln(e.uniforms),this.uniformsGroups=Jh(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const n in this.uniforms){const a=this.uniforms[n].value;a&&a.isTexture?t.uniforms[n]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[n]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[n]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[n]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[n]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[n]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[n]={type:"m4",value:a.toArray()}:t.uniforms[n]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const i={};for(const n in this.extensions)this.extensions[n]===!0&&(i[n]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}}class lc extends bt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Ke,this.projectionMatrix=new Ke,this.projectionMatrixInverse=new Ke,this.coordinateSystem=mi}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const Ri=new w,Io=new Te,Do=new Te;class kt extends lc{constructor(e=50,t=1,i=.1,n=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=n,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=ns*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(Qn*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return ns*2*Math.atan(Math.tan(Qn*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,i){Ri.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Ri.x,Ri.y).multiplyScalar(-e/Ri.z),Ri.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(Ri.x,Ri.y).multiplyScalar(-e/Ri.z)}getViewSize(e,t){return this.getViewBounds(e,Io,Do),t.subVectors(Do,Io)}setViewOffset(e,t,i,n,r,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=n,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(Qn*.5*this.fov)/this.zoom,i=2*t,n=this.aspect*i,r=-.5*n;const a=this.view;if(this.view!==null&&this.view.enabled){const l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*n/l,t-=a.offsetY*i/c,n*=a.width/l,i*=a.height/c}const o=this.filmOffset;o!==0&&(r+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+n,t,t-i,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const dn=-90,fn=1;class nu extends bt{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;const n=new kt(dn,fn,e,t);n.layers=this.layers,this.add(n);const r=new kt(dn,fn,e,t);r.layers=this.layers,this.add(r);const a=new kt(dn,fn,e,t);a.layers=this.layers,this.add(a);const o=new kt(dn,fn,e,t);o.layers=this.layers,this.add(o);const l=new kt(dn,fn,e,t);l.layers=this.layers,this.add(l);const c=new kt(dn,fn,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[i,n,r,a,o,l]=t;for(const c of t)this.remove(c);if(e===mi)i.up.set(0,1,0),i.lookAt(1,0,0),n.up.set(0,1,0),n.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===js)i.up.set(0,-1,0),i.lookAt(-1,0,0),n.up.set(0,-1,0),n.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:i,activeMipmapLevel:n}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[r,a,o,l,c,h]=this.children,d=e.getRenderTarget(),f=e.getActiveCubeFace(),p=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;const y=i.texture.generateMipmaps;i.texture.generateMipmaps=!1,e.setRenderTarget(i,0,n),e.render(t,r),e.setRenderTarget(i,1,n),e.render(t,a),e.setRenderTarget(i,2,n),e.render(t,o),e.setRenderTarget(i,3,n),e.render(t,l),e.setRenderTarget(i,4,n),e.render(t,c),i.texture.generateMipmaps=y,e.setRenderTarget(i,5,n),e.render(t,h),e.setRenderTarget(d,f,p),e.xr.enabled=g,i.texture.needsPMREMUpdate=!0}}class cc extends Mt{constructor(e,t,i,n,r,a,o,l,c,h){e=e!==void 0?e:[],t=t!==void 0?t:Cn,super(e,t,i,n,r,a,o,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class su extends Ki{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const i={width:e,height:e,depth:1},n=[i,i,i,i,i,i];this.texture=new cc(n,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:Ht}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const i={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},n=new os(5,5,5),r=new dt({name:"CubemapFromEquirect",uniforms:Ln(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:Ut,blending:Ii});r.uniforms.tEquirect.value=t;const a=new at(n,r),o=t.minFilter;return t.minFilter===Pi&&(t.minFilter=Ht),new nu(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t,i,n){const r=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,i,n);e.setRenderTarget(r)}}class ru extends bt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new ni,this.environmentIntensity=1,this.environmentRotation=new ni,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}class au{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=Ia,this.updateRanges=[],this.version=0,this.uuid=yi()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,i){e*=this.stride,i*=t.stride;for(let n=0,r=this.stride;n<r;n++)this.array[e+n]=t.array[i+n];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=yi()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),i=new this.constructor(t,this.stride);return i.setUsage(this.usage),i}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=yi()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const Pt=new w;class Qs{constructor(e,t,i,n=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=i,this.normalized=n}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,i=this.data.count;t<i;t++)Pt.fromBufferAttribute(this,t),Pt.applyMatrix4(e),this.setXYZ(t,Pt.x,Pt.y,Pt.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)Pt.fromBufferAttribute(this,t),Pt.applyNormalMatrix(e),this.setXYZ(t,Pt.x,Pt.y,Pt.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)Pt.fromBufferAttribute(this,t),Pt.transformDirection(e),this.setXYZ(t,Pt.x,Pt.y,Pt.z);return this}getComponent(e,t){let i=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(i=ii(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=et(i,this.array)),this.data.array[e*this.data.stride+this.offset+t]=i,this}setX(e,t){return this.normalized&&(t=et(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=et(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=et(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=et(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=ii(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=ii(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=ii(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=ii(t,this.array)),t}setXY(e,t,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=et(t,this.array),i=et(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this}setXYZ(e,t,i,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=et(t,this.array),i=et(i,this.array),n=et(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this.data.array[e+2]=n,this}setXYZW(e,t,i,n,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=et(t,this.array),i=et(i,this.array),n=et(n,this.array),r=et(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this.data.array[e+2]=n,this.data.array[e+3]=r,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let i=0;i<this.count;i++){const n=i*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[n+r])}return new lt(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new Qs(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let i=0;i<this.count;i++){const n=i*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[n+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}class hc extends bi{constructor(e){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new Ae(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}let pn;const Vn=new w,mn=new w,gn=new w,vn=new Te,Gn=new Te,uc=new Ke,Cs=new w,Wn=new w,As=new w,Lo=new Te,Pr=new Te,Fo=new Te;class Uo extends bt{constructor(e=new hc){if(super(),this.isSprite=!0,this.type="Sprite",pn===void 0){pn=new vt;const t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),i=new au(t,5);pn.setIndex([0,1,2,0,2,3]),pn.setAttribute("position",new Qs(i,3,0,!1)),pn.setAttribute("uv",new Qs(i,2,3,!1))}this.geometry=pn,this.material=e,this.center=new Te(.5,.5)}raycast(e,t){e.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),mn.setFromMatrixScale(this.matrixWorld),uc.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),gn.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&mn.multiplyScalar(-gn.z);const i=this.material.rotation;let n,r;i!==0&&(r=Math.cos(i),n=Math.sin(i));const a=this.center;Ps(Cs.set(-.5,-.5,0),gn,a,mn,n,r),Ps(Wn.set(.5,-.5,0),gn,a,mn,n,r),Ps(As.set(.5,.5,0),gn,a,mn,n,r),Lo.set(0,0),Pr.set(1,0),Fo.set(1,1);let o=e.ray.intersectTriangle(Cs,Wn,As,!1,Vn);if(o===null&&(Ps(Wn.set(-.5,.5,0),gn,a,mn,n,r),Pr.set(0,1),o=e.ray.intersectTriangle(Cs,As,Wn,!1,Vn),o===null))return;const l=e.ray.origin.distanceTo(Vn);l<e.near||l>e.far||t.push({distance:l,point:Vn.clone(),uv:Yt.getInterpolation(Vn,Cs,Wn,As,Lo,Pr,Fo,new Te),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}}function Ps(s,e,t,i,n,r){vn.subVectors(s,t).addScalar(.5).multiply(i),n!==void 0?(Gn.x=r*vn.x-n*vn.y,Gn.y=n*vn.x+r*vn.y):Gn.copy(vn),s.copy(e),s.x+=Gn.x,s.y+=Gn.y,s.applyMatrix4(uc)}class ou extends Mt{constructor(e=null,t=1,i=1,n,r,a,o,l,c=Vt,h=Vt,d,f){super(null,a,o,l,c,h,n,r,d,f),this.isDataTexture=!0,this.image={data:e,width:t,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Ft extends lt{constructor(e,t,i,n=1){super(e,t,i),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=n}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){const e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}}const yn=new Ke,Bo=new Ke,Is=[],No=new ji,lu=new Ke,Xn=new at,qn=new Qi;class Oo extends at{constructor(e,t,i){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Ft(new Float32Array(i*16),16),this.instanceColor=null,this.morphTexture=null,this.count=i,this.boundingBox=null,this.boundingSphere=null;for(let n=0;n<i;n++)this.setMatrixAt(n,lu)}computeBoundingBox(){const e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new ji),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let i=0;i<t;i++)this.getMatrixAt(i,yn),No.copy(e.boundingBox).applyMatrix4(yn),this.boundingBox.union(No)}computeBoundingSphere(){const e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new Qi),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let i=0;i<t;i++)this.getMatrixAt(i,yn),qn.copy(e.boundingSphere).applyMatrix4(yn),this.boundingSphere.union(qn)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){const i=t.morphTargetInfluences,n=this.morphTexture.source.data.data,r=i.length+1,a=e*r+1;for(let o=0;o<i.length;o++)i[o]=n[a+o]}raycast(e,t){const i=this.matrixWorld,n=this.count;if(Xn.geometry=this.geometry,Xn.material=this.material,Xn.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),qn.copy(this.boundingSphere),qn.applyMatrix4(i),e.ray.intersectsSphere(qn)!==!1))for(let r=0;r<n;r++){this.getMatrixAt(r,yn),Bo.multiplyMatrices(i,yn),Xn.matrixWorld=Bo,Xn.raycast(e,Is);for(let a=0,o=Is.length;a<o;a++){const l=Is[a];l.instanceId=r,l.object=this,t.push(l)}Is.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new Ft(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){const i=t.morphTargetInfluences,n=i.length+1;this.morphTexture===null&&(this.morphTexture=new ou(new Float32Array(n*this.count),n,this.count,Ha,ai));const r=this.morphTexture.source.data.data;let a=0;for(let c=0;c<i.length;c++)a+=i[c];const o=this.geometry.morphTargetsRelative?1:1-a,l=n*e;r[l]=o,r.set(i,l+1)}updateMorphTargets(){}dispose(){return this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null),this}}const Ir=new w,cu=new w,hu=new Fe;class Ci{constructor(e=new w(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,n){return this.normal.set(e,t,i),this.constant=n,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){const n=Ir.subVectors(i,t).cross(cu.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(n,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const i=e.delta(Ir),n=this.normal.dot(i);if(n===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const r=-(e.start.dot(this.normal)+this.constant)/n;return r<0||r>1?null:t.copy(e.start).addScaledVector(i,r)}intersectsLine(e){const t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const i=t||hu.getNormalMatrix(e),n=this.coplanarPoint(Ir).applyMatrix4(e),r=this.normal.applyMatrix3(i).normalize();return this.constant=-n.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const zi=new Qi,Ds=new w;class Ya{constructor(e=new Ci,t=new Ci,i=new Ci,n=new Ci,r=new Ci,a=new Ci){this.planes=[e,t,i,n,r,a]}set(e,t,i,n,r,a){const o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(i),o[3].copy(n),o[4].copy(r),o[5].copy(a),this}copy(e){const t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=mi){const i=this.planes,n=e.elements,r=n[0],a=n[1],o=n[2],l=n[3],c=n[4],h=n[5],d=n[6],f=n[7],p=n[8],g=n[9],y=n[10],m=n[11],u=n[12],v=n[13],_=n[14],x=n[15];if(i[0].setComponents(l-r,f-c,m-p,x-u).normalize(),i[1].setComponents(l+r,f+c,m+p,x+u).normalize(),i[2].setComponents(l+a,f+h,m+g,x+v).normalize(),i[3].setComponents(l-a,f-h,m-g,x-v).normalize(),i[4].setComponents(l-o,f-d,m-y,x-_).normalize(),t===mi)i[5].setComponents(l+o,f+d,m+y,x+_).normalize();else if(t===js)i[5].setComponents(o,d,y,_).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),zi.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),zi.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(zi)}intersectsSprite(e){return zi.center.set(0,0,0),zi.radius=.7071067811865476,zi.applyMatrix4(e.matrixWorld),this.intersectsSphere(zi)}intersectsSphere(e){const t=this.planes,i=e.center,n=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(i)<n)return!1;return!0}intersectsBox(e){const t=this.planes;for(let i=0;i<6;i++){const n=t[i];if(Ds.x=n.normal.x>0?e.max.x:e.min.x,Ds.y=n.normal.y>0?e.max.y:e.min.y,Ds.z=n.normal.z>0?e.max.z:e.min.z,n.distanceToPoint(Ds)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class es extends bi{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Ae(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const Js=new w,er=new w,zo=new Ke,$n=new rr,Ls=new Qi,Dr=new w,ko=new w;class tr extends bt{constructor(e=new vt,t=new es){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,i=[0];for(let n=1,r=t.count;n<r;n++)Js.fromBufferAttribute(t,n-1),er.fromBufferAttribute(t,n),i[n]=i[n-1],i[n]+=Js.distanceTo(er);e.setAttribute("lineDistance",new ft(i,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const i=this.geometry,n=this.matrixWorld,r=e.params.Line.threshold,a=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),Ls.copy(i.boundingSphere),Ls.applyMatrix4(n),Ls.radius+=r,e.ray.intersectsSphere(Ls)===!1)return;zo.copy(n).invert(),$n.copy(e.ray).applyMatrix4(zo);const o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=this.isLineSegments?2:1,h=i.index,f=i.attributes.position;if(h!==null){const p=Math.max(0,a.start),g=Math.min(h.count,a.start+a.count);for(let y=p,m=g-1;y<m;y+=c){const u=h.getX(y),v=h.getX(y+1),_=Fs(this,e,$n,l,u,v);_&&t.push(_)}if(this.isLineLoop){const y=h.getX(g-1),m=h.getX(p),u=Fs(this,e,$n,l,y,m);u&&t.push(u)}}else{const p=Math.max(0,a.start),g=Math.min(f.count,a.start+a.count);for(let y=p,m=g-1;y<m;y+=c){const u=Fs(this,e,$n,l,y,y+1);u&&t.push(u)}if(this.isLineLoop){const y=Fs(this,e,$n,l,g-1,p);y&&t.push(y)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const n=t[i[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=n.length;r<a;r++){const o=n[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}}function Fs(s,e,t,i,n,r){const a=s.geometry.attributes.position;if(Js.fromBufferAttribute(a,n),er.fromBufferAttribute(a,r),t.distanceSqToSegment(Js,er,Dr,ko)>i)return;Dr.applyMatrix4(s.matrixWorld);const l=e.ray.origin.distanceTo(Dr);if(!(l<e.near||l>e.far))return{distance:l,point:ko.clone().applyMatrix4(s.matrixWorld),index:n,face:null,faceIndex:null,barycoord:null,object:s}}const Ho=new w,Vo=new w;class Lr extends tr{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,i=[];for(let n=0,r=t.count;n<r;n+=2)Ho.fromBufferAttribute(t,n),Vo.fromBufferAttribute(t,n+1),i[n]=n===0?0:i[n-1],i[n+1]=i[n]+Ho.distanceTo(Vo);e.setAttribute("lineDistance",new ft(i,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class uu extends bi{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new Ae(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}const Go=new Ke,Da=new rr,Us=new Qi,Bs=new w;class du extends bt{constructor(e=new vt,t=new uu){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){const i=this.geometry,n=this.matrixWorld,r=e.params.Points.threshold,a=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),Us.copy(i.boundingSphere),Us.applyMatrix4(n),Us.radius+=r,e.ray.intersectsSphere(Us)===!1)return;Go.copy(n).invert(),Da.copy(e.ray).applyMatrix4(Go);const o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=i.index,d=i.attributes.position;if(c!==null){const f=Math.max(0,a.start),p=Math.min(c.count,a.start+a.count);for(let g=f,y=p;g<y;g++){const m=c.getX(g);Bs.fromBufferAttribute(d,m),Wo(Bs,m,l,n,e,t,this)}}else{const f=Math.max(0,a.start),p=Math.min(d.count,a.start+a.count);for(let g=f,y=p;g<y;g++)Bs.fromBufferAttribute(d,g),Wo(Bs,g,l,n,e,t,this)}}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const n=t[i[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=n.length;r<a;r++){const o=n[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}}function Wo(s,e,t,i,n,r,a){const o=Da.distanceSqToPoint(s);if(o<t){const l=new w;Da.closestPointToPoint(s,l),l.applyMatrix4(i);const c=n.ray.origin.distanceTo(l);if(c<n.near||c>n.far)return;r.push({distance:c,distanceToRay:Math.sqrt(o),point:l,index:e,face:null,faceIndex:null,barycoord:null,object:a})}}class gi extends bt{constructor(){super(),this.isGroup=!0,this.type="Group"}}class Za extends Mt{constructor(e,t,i,n,r,a,o,l,c){super(e,t,i,n,r,a,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}}class dc extends Mt{constructor(e,t,i,n,r,a,o,l,c,h=En){if(h!==En&&h!==In)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");i===void 0&&h===En&&(i=Zi),i===void 0&&h===In&&(i=Pn),super(null,n,r,a,o,l,h,i,c),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=o!==void 0?o:Vt,this.minFilter=l!==void 0?l:Vt,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}class Ka extends vt{constructor(e=1,t=1,i=1,n=32,r=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:i,radialSegments:n,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:l};const c=this;n=Math.floor(n),r=Math.floor(r);const h=[],d=[],f=[],p=[];let g=0;const y=[],m=i/2;let u=0;v(),a===!1&&(e>0&&_(!0),t>0&&_(!1)),this.setIndex(h),this.setAttribute("position",new ft(d,3)),this.setAttribute("normal",new ft(f,3)),this.setAttribute("uv",new ft(p,2));function v(){const x=new w,T=new w;let C=0;const A=(t-e)/i;for(let P=0;P<=r;P++){const M=[],S=P/r,I=S*(t-e)+e;for(let F=0;F<=n;F++){const N=F/n,W=N*l+o,$=Math.sin(W),X=Math.cos(W);T.x=I*$,T.y=-S*i+m,T.z=I*X,d.push(T.x,T.y,T.z),x.set($,A,X).normalize(),f.push(x.x,x.y,x.z),p.push(N,1-S),M.push(g++)}y.push(M)}for(let P=0;P<n;P++)for(let M=0;M<r;M++){const S=y[M][P],I=y[M+1][P],F=y[M+1][P+1],N=y[M][P+1];(e>0||M!==0)&&(h.push(S,I,N),C+=3),(t>0||M!==r-1)&&(h.push(I,F,N),C+=3)}c.addGroup(u,C,0),u+=C}function _(x){const T=g,C=new Te,A=new w;let P=0;const M=x===!0?e:t,S=x===!0?1:-1;for(let F=1;F<=n;F++)d.push(0,m*S,0),f.push(0,S,0),p.push(.5,.5),g++;const I=g;for(let F=0;F<=n;F++){const W=F/n*l+o,$=Math.cos(W),X=Math.sin(W);A.x=M*X,A.y=m*S,A.z=M*$,d.push(A.x,A.y,A.z),f.push(0,S,0),C.x=$*.5+.5,C.y=X*.5*S+.5,p.push(C.x,C.y),g++}for(let F=0;F<n;F++){const N=T+F,W=I+F;x===!0?h.push(W,W+1,N):h.push(W+1,W,N),P+=3}c.addGroup(u,P,x===!0?1:2),u+=P}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ka(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class ja extends vt{constructor(e=[],t=[],i=1,n=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:i,detail:n};const r=[],a=[];o(n),c(i),h(),this.setAttribute("position",new ft(r,3)),this.setAttribute("normal",new ft(r.slice(),3)),this.setAttribute("uv",new ft(a,2)),n===0?this.computeVertexNormals():this.normalizeNormals();function o(v){const _=new w,x=new w,T=new w;for(let C=0;C<t.length;C+=3)p(t[C+0],_),p(t[C+1],x),p(t[C+2],T),l(_,x,T,v)}function l(v,_,x,T){const C=T+1,A=[];for(let P=0;P<=C;P++){A[P]=[];const M=v.clone().lerp(x,P/C),S=_.clone().lerp(x,P/C),I=C-P;for(let F=0;F<=I;F++)F===0&&P===C?A[P][F]=M:A[P][F]=M.clone().lerp(S,F/I)}for(let P=0;P<C;P++)for(let M=0;M<2*(C-P)-1;M++){const S=Math.floor(M/2);M%2===0?(f(A[P][S+1]),f(A[P+1][S]),f(A[P][S])):(f(A[P][S+1]),f(A[P+1][S+1]),f(A[P+1][S]))}}function c(v){const _=new w;for(let x=0;x<r.length;x+=3)_.x=r[x+0],_.y=r[x+1],_.z=r[x+2],_.normalize().multiplyScalar(v),r[x+0]=_.x,r[x+1]=_.y,r[x+2]=_.z}function h(){const v=new w;for(let _=0;_<r.length;_+=3){v.x=r[_+0],v.y=r[_+1],v.z=r[_+2];const x=m(v)/2/Math.PI+.5,T=u(v)/Math.PI+.5;a.push(x,1-T)}g(),d()}function d(){for(let v=0;v<a.length;v+=6){const _=a[v+0],x=a[v+2],T=a[v+4],C=Math.max(_,x,T),A=Math.min(_,x,T);C>.9&&A<.1&&(_<.2&&(a[v+0]+=1),x<.2&&(a[v+2]+=1),T<.2&&(a[v+4]+=1))}}function f(v){r.push(v.x,v.y,v.z)}function p(v,_){const x=v*3;_.x=e[x+0],_.y=e[x+1],_.z=e[x+2]}function g(){const v=new w,_=new w,x=new w,T=new w,C=new Te,A=new Te,P=new Te;for(let M=0,S=0;M<r.length;M+=9,S+=6){v.set(r[M+0],r[M+1],r[M+2]),_.set(r[M+3],r[M+4],r[M+5]),x.set(r[M+6],r[M+7],r[M+8]),C.set(a[S+0],a[S+1]),A.set(a[S+2],a[S+3]),P.set(a[S+4],a[S+5]),T.copy(v).add(_).add(x).divideScalar(3);const I=m(T);y(C,S+0,v,I),y(A,S+2,_,I),y(P,S+4,x,I)}}function y(v,_,x,T){T<0&&v.x===1&&(a[_]=v.x-1),x.x===0&&x.z===0&&(a[_]=T/2/Math.PI+.5)}function m(v){return Math.atan2(v.z,-v.x)}function u(v){return Math.atan2(-v.y,Math.sqrt(v.x*v.x+v.z*v.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ja(e.vertices,e.indices,e.radius,e.details)}}class ir extends ja{constructor(e=1,t=0){const i=(1+Math.sqrt(5))/2,n=[-1,i,0,1,i,0,-1,-i,0,1,-i,0,0,-1,i,0,1,i,0,-1,-i,0,1,-i,i,0,-1,i,0,1,-i,0,-1,-i,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(n,r,e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new ir(e.radius,e.detail)}}class Yi extends vt{constructor(e=1,t=1,i=1,n=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:i,heightSegments:n};const r=e/2,a=t/2,o=Math.floor(i),l=Math.floor(n),c=o+1,h=l+1,d=e/o,f=t/l,p=[],g=[],y=[],m=[];for(let u=0;u<h;u++){const v=u*f-a;for(let _=0;_<c;_++){const x=_*d-r;g.push(x,-v,0),y.push(0,0,1),m.push(_/o),m.push(1-u/l)}}for(let u=0;u<l;u++)for(let v=0;v<o;v++){const _=v+c*u,x=v+c*(u+1),T=v+1+c*(u+1),C=v+1+c*u;p.push(_,x,C),p.push(x,T,C)}this.setIndex(p),this.setAttribute("position",new ft(g,3)),this.setAttribute("normal",new ft(y,3)),this.setAttribute("uv",new ft(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Yi(e.width,e.height,e.widthSegments,e.heightSegments)}}class ar extends vt{constructor(e=.5,t=1,i=32,n=1,r=0,a=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:i,phiSegments:n,thetaStart:r,thetaLength:a},i=Math.max(3,i),n=Math.max(1,n);const o=[],l=[],c=[],h=[];let d=e;const f=(t-e)/n,p=new w,g=new Te;for(let y=0;y<=n;y++){for(let m=0;m<=i;m++){const u=r+m/i*a;p.x=d*Math.cos(u),p.y=d*Math.sin(u),l.push(p.x,p.y,p.z),c.push(0,0,1),g.x=(p.x/t+1)/2,g.y=(p.y/t+1)/2,h.push(g.x,g.y)}d+=f}for(let y=0;y<n;y++){const m=y*(i+1);for(let u=0;u<i;u++){const v=u+m,_=v,x=v+i+1,T=v+i+2,C=v+1;o.push(_,x,C),o.push(x,T,C)}}this.setIndex(o),this.setAttribute("position",new ft(l,3)),this.setAttribute("normal",new ft(c,3)),this.setAttribute("uv",new ft(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ar(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}}class ti extends vt{constructor(e=1,t=32,i=16,n=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:i,phiStart:n,phiLength:r,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),i=Math.max(2,Math.floor(i));const l=Math.min(a+o,Math.PI);let c=0;const h=[],d=new w,f=new w,p=[],g=[],y=[],m=[];for(let u=0;u<=i;u++){const v=[],_=u/i;let x=0;u===0&&a===0?x=.5/t:u===i&&l===Math.PI&&(x=-.5/t);for(let T=0;T<=t;T++){const C=T/t;d.x=-e*Math.cos(n+C*r)*Math.sin(a+_*o),d.y=e*Math.cos(a+_*o),d.z=e*Math.sin(n+C*r)*Math.sin(a+_*o),g.push(d.x,d.y,d.z),f.copy(d).normalize(),y.push(f.x,f.y,f.z),m.push(C+x,1-_),v.push(c++)}h.push(v)}for(let u=0;u<i;u++)for(let v=0;v<t;v++){const _=h[u][v+1],x=h[u][v],T=h[u+1][v],C=h[u+1][v+1];(u!==0||a>0)&&p.push(_,x,C),(u!==i-1||l<Math.PI)&&p.push(x,T,C)}this.setIndex(p),this.setAttribute("position",new ft(g,3)),this.setAttribute("normal",new ft(y,3)),this.setAttribute("uv",new ft(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ti(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class Kn extends bi{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Ae(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ae(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Xa,this.normalScale=new Te(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new ni,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class Xo extends bi{constructor(e){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new Ae(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ae(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Xa,this.normalScale=new Te(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new ni,this.combine=Na,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class fu extends bi{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=oh,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class pu extends bi{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}const qo={enabled:!1,files:{},add:function(s,e){this.enabled!==!1&&(this.files[s]=e)},get:function(s){if(this.enabled!==!1)return this.files[s]},remove:function(s){delete this.files[s]},clear:function(){this.files={}}};class mu{constructor(e,t,i){const n=this;let r=!1,a=0,o=0,l;const c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=i,this.itemStart=function(h){o++,r===!1&&n.onStart!==void 0&&n.onStart(h,a,o),r=!0},this.itemEnd=function(h){a++,n.onProgress!==void 0&&n.onProgress(h,a,o),a===o&&(r=!1,n.onLoad!==void 0&&n.onLoad())},this.itemError=function(h){n.onError!==void 0&&n.onError(h)},this.resolveURL=function(h){return l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,d){return c.push(h,d),this},this.removeHandler=function(h){const d=c.indexOf(h);return d!==-1&&c.splice(d,2),this},this.getHandler=function(h){for(let d=0,f=c.length;d<f;d+=2){const p=c[d],g=c[d+1];if(p.global&&(p.lastIndex=0),p.test(h))return g}return null}}}const gu=new mu;class Qa{constructor(e){this.manager=e!==void 0?e:gu,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){const i=this;return new Promise(function(n,r){i.load(e,n,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}}Qa.DEFAULT_MATERIAL_NAME="__DEFAULT";class vu extends Qa{constructor(e){super(e)}load(e,t,i,n){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=this,a=qo.get(e);if(a!==void 0)return r.manager.itemStart(e),setTimeout(function(){t&&t(a),r.manager.itemEnd(e)},0),a;const o=ss("img");function l(){h(),qo.add(e,this),t&&t(this),r.manager.itemEnd(e)}function c(d){h(),n&&n(d),r.manager.itemError(e),r.manager.itemEnd(e)}function h(){o.removeEventListener("load",l,!1),o.removeEventListener("error",c,!1)}return o.addEventListener("load",l,!1),o.addEventListener("error",c,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(o.crossOrigin=this.crossOrigin),r.manager.itemStart(e),o.src=e,o}}class yu extends Qa{constructor(e){super(e)}load(e,t,i,n){const r=new Mt,a=new vu(this.manager);return a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(e,function(o){r.image=o,r.needsUpdate=!0,t!==void 0&&t(r)},i,n),r}}class fc extends bt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ae(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}}const Fr=new Ke,$o=new w,Yo=new w;class xu{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Te(512,512),this.map=null,this.mapPass=null,this.matrix=new Ke,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Ya,this._frameExtents=new Te(1,1),this._viewportCount=1,this._viewports=[new it(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,i=this.matrix;$o.setFromMatrixPosition(e.matrixWorld),t.position.copy($o),Yo.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Yo),t.updateMatrixWorld(),Fr.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Fr),i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(Fr)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}const Zo=new Ke,Yn=new w,Ur=new w;class _u extends xu{constructor(){super(new kt(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new Te(4,2),this._viewportCount=6,this._viewports=[new it(2,1,1,1),new it(0,1,1,1),new it(3,1,1,1),new it(1,1,1,1),new it(3,0,1,1),new it(1,0,1,1)],this._cubeDirections=[new w(1,0,0),new w(-1,0,0),new w(0,0,1),new w(0,0,-1),new w(0,1,0),new w(0,-1,0)],this._cubeUps=[new w(0,1,0),new w(0,1,0),new w(0,1,0),new w(0,1,0),new w(0,0,1),new w(0,0,-1)]}updateMatrices(e,t=0){const i=this.camera,n=this.matrix,r=e.distance||i.far;r!==i.far&&(i.far=r,i.updateProjectionMatrix()),Yn.setFromMatrixPosition(e.matrixWorld),i.position.copy(Yn),Ur.copy(i.position),Ur.add(this._cubeDirections[t]),i.up.copy(this._cubeUps[t]),i.lookAt(Ur),i.updateMatrixWorld(),n.makeTranslation(-Yn.x,-Yn.y,-Yn.z),Zo.multiplyMatrices(i.projectionMatrix,i.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Zo)}}class bu extends fc{constructor(e,t,i=0,n=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=i,this.decay=n,this.shadow=new _u}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}}class Su extends lc{constructor(e=-1,t=1,i=1,n=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=n,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,n,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=n,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,n=(this.top+this.bottom)/2;let r=i-e,a=i+e,o=n+t,l=n-t;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=h*this.view.offsetY,l=o-h*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}class Mu extends fc{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}}class Br extends vt{constructor(){super(),this.isInstancedBufferGeometry=!0,this.type="InstancedBufferGeometry",this.instanceCount=1/0}copy(e){return super.copy(e),this.instanceCount=e.instanceCount,this}toJSON(){const e=super.toJSON();return e.instanceCount=this.instanceCount,e.isInstancedBufferGeometry=!0,e}}class Eu extends kt{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}}const Ko=new Ke;class jo{constructor(e,t,i=0,n=1/0){this.ray=new rr(e,t),this.near=i,this.far=n,this.camera=null,this.layers=new $a,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):console.error("THREE.Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return Ko.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Ko),this}intersectObject(e,t=!0,i=[]){return La(e,this,i,t),i.sort(Qo),i}intersectObjects(e,t=!0,i=[]){for(let n=0,r=e.length;n<r;n++)La(e[n],this,i,t);return i.sort(Qo),i}}function Qo(s,e){return s.distance-e.distance}function La(s,e,t,i){let n=!0;if(s.layers.test(e.layers)&&s.raycast(e,t)===!1&&(n=!1),n===!0&&i===!0){const r=s.children;for(let a=0,o=r.length;a<o;a++)La(r[a],e,t,!0)}}const Jo=new w;let Ns,Nr;class wu extends bt{constructor(e=new w(0,0,1),t=new w(0,0,0),i=1,n=16776960,r=i*.2,a=r*.2){super(),this.type="ArrowHelper",Ns===void 0&&(Ns=new vt,Ns.setAttribute("position",new ft([0,0,0,0,1,0],3)),Nr=new Ka(0,.5,1,5,1),Nr.translate(0,-.5,0)),this.position.copy(t),this.line=new tr(Ns,new es({color:n,toneMapped:!1})),this.line.matrixAutoUpdate=!1,this.add(this.line),this.cone=new at(Nr,new Tn({color:n,toneMapped:!1})),this.cone.matrixAutoUpdate=!1,this.add(this.cone),this.setDirection(e),this.setLength(i,r,a)}setDirection(e){if(e.y>.99999)this.quaternion.set(0,0,0,1);else if(e.y<-.99999)this.quaternion.set(1,0,0,0);else{Jo.set(e.z,0,-e.x).normalize();const t=Math.acos(e.y);this.quaternion.setFromAxisAngle(Jo,t)}}setLength(e,t=e*.2,i=t*.2){this.line.scale.set(1,Math.max(1e-4,e-t),1),this.line.updateMatrix(),this.cone.scale.set(i,t,i),this.cone.position.y=e,this.cone.updateMatrix()}setColor(e){this.line.material.color.set(e),this.cone.material.color.set(e)}copy(e){return super.copy(e,!1),this.line.copy(e.line),this.cone.copy(e.cone),this}dispose(){this.line.geometry.dispose(),this.line.material.dispose(),this.cone.geometry.dispose(),this.cone.material.dispose()}}function el(s,e,t,i){const n=Tu(i);switch(t){case Yl:return s*e;case Kl:return s*e;case jl:return s*e*2;case Ha:return s*e/n.components*n.byteLength;case Va:return s*e/n.components*n.byteLength;case Ql:return s*e*2/n.components*n.byteLength;case Ga:return s*e*2/n.components*n.byteLength;case Zl:return s*e*3/n.components*n.byteLength;case Zt:return s*e*4/n.components*n.byteLength;case Wa:return s*e*4/n.components*n.byteLength;case Gs:case Ws:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*8;case Xs:case qs:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case aa:case la:return Math.max(s,16)*Math.max(e,8)/4;case ra:case oa:return Math.max(s,8)*Math.max(e,8)/2;case ca:case ha:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*8;case ua:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case da:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case fa:return Math.floor((s+4)/5)*Math.floor((e+3)/4)*16;case pa:return Math.floor((s+4)/5)*Math.floor((e+4)/5)*16;case ma:return Math.floor((s+5)/6)*Math.floor((e+4)/5)*16;case ga:return Math.floor((s+5)/6)*Math.floor((e+5)/6)*16;case va:return Math.floor((s+7)/8)*Math.floor((e+4)/5)*16;case ya:return Math.floor((s+7)/8)*Math.floor((e+5)/6)*16;case xa:return Math.floor((s+7)/8)*Math.floor((e+7)/8)*16;case _a:return Math.floor((s+9)/10)*Math.floor((e+4)/5)*16;case ba:return Math.floor((s+9)/10)*Math.floor((e+5)/6)*16;case Sa:return Math.floor((s+9)/10)*Math.floor((e+7)/8)*16;case Ma:return Math.floor((s+9)/10)*Math.floor((e+9)/10)*16;case Ea:return Math.floor((s+11)/12)*Math.floor((e+9)/10)*16;case wa:return Math.floor((s+11)/12)*Math.floor((e+11)/12)*16;case $s:case Ta:case Ra:return Math.ceil(s/4)*Math.ceil(e/4)*16;case Jl:case Ca:return Math.ceil(s/4)*Math.ceil(e/4)*8;case Aa:case Pa:return Math.ceil(s/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function Tu(s){switch(s){case _i:case Xl:return{byteLength:1,components:1};case is:case ql:case as:return{byteLength:2,components:1};case za:case ka:return{byteLength:2,components:4};case Zi:case Oa:case ai:return{byteLength:4,components:1};case $l:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${s}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Ba}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Ba);/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */function pc(){let s=null,e=!1,t=null,i=null;function n(r,a){t(r,a),i=s.requestAnimationFrame(n)}return{start:function(){e!==!0&&t!==null&&(i=s.requestAnimationFrame(n),e=!0)},stop:function(){s.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){s=r}}}function Ru(s){const e=new WeakMap;function t(o,l){const c=o.array,h=o.usage,d=c.byteLength,f=s.createBuffer();s.bindBuffer(l,f),s.bufferData(l,c,h),o.onUploadCallback();let p;if(c instanceof Float32Array)p=s.FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?p=s.HALF_FLOAT:p=s.UNSIGNED_SHORT;else if(c instanceof Int16Array)p=s.SHORT;else if(c instanceof Uint32Array)p=s.UNSIGNED_INT;else if(c instanceof Int32Array)p=s.INT;else if(c instanceof Int8Array)p=s.BYTE;else if(c instanceof Uint8Array)p=s.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)p=s.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:f,type:p,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:d}}function i(o,l,c){const h=l.array,d=l.updateRanges;if(s.bindBuffer(c,o),d.length===0)s.bufferSubData(c,0,h);else{d.sort((p,g)=>p.start-g.start);let f=0;for(let p=1;p<d.length;p++){const g=d[f],y=d[p];y.start<=g.start+g.count+1?g.count=Math.max(g.count,y.start+y.count-g.start):(++f,d[f]=y)}d.length=f+1;for(let p=0,g=d.length;p<g;p++){const y=d[p];s.bufferSubData(c,y.start*h.BYTES_PER_ELEMENT,h,y.start,y.count)}l.clearUpdateRanges()}l.onUploadCallback()}function n(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);const l=e.get(o);l&&(s.deleteBuffer(l.buffer),e.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){const h=e.get(o);(!h||h.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}const c=e.get(o);if(c===void 0)e.set(o,t(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(c.buffer,o,l),c.version=o.version}}return{get:n,remove:r,update:a}}var Cu=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Au=`#ifdef USE_ALPHAHASH
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
#endif`,Pu=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Iu=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Du=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Lu=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Fu=`#ifdef USE_AOMAP
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
#endif`,Uu=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Bu=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
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
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,Nu=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Ou=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,zu=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,ku=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,Hu=`#ifdef USE_IRIDESCENCE
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
#endif`,Vu=`#ifdef USE_BUMPMAP
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
#endif`,Gu=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
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
	#endif
#endif`,Wu=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Xu=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,qu=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,$u=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Yu=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Zu=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,Ku=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,ju=`#define PI 3.141592653589793
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
} // validated`,Qu=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,Ju=`vec3 transformedNormal = objectNormal;
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
#endif`,ed=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,td=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,id=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,nd=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,sd="gl_FragColor = linearToOutputTexel( gl_FragColor );",rd=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,ad=`#ifdef USE_ENVMAP
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
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
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
#endif`,od=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,ld=`#ifdef USE_ENVMAP
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
#endif`,cd=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,hd=`#ifdef USE_ENVMAP
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
#endif`,ud=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,dd=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,fd=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,pd=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,md=`#ifdef USE_GRADIENTMAP
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
}`,gd=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,vd=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,yd=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,xd=`uniform bool receiveShadow;
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
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
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
#endif`,_d=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
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
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
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
#endif`,bd=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Sd=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Md=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Ed=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,wd=`PhysicalMaterial material;
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
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
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
#endif`,Td=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
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
}`,Rd=`
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
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
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
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
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
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
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
#endif`,Cd=`#if defined( RE_IndirectDiffuse )
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
#endif`,Ad=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Pd=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Id=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Dd=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Ld=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Fd=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Ud=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Bd=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,Nd=`#if defined( USE_POINTS_UV )
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
#endif`,Od=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,zd=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,kd=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Hd=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Vd=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Gd=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,Wd=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Xd=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,qd=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,$d=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Yd=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Zd=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Kd=`#ifdef USE_NORMALMAP
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
#endif`,jd=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Qd=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Jd=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,ef=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,tf=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,nf=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
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
}`,sf=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,rf=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,af=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,of=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,lf=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,cf=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,hf=`#if NUM_SPOT_LIGHT_COORDS > 0
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
			float shadowIntensity;
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
			float shadowIntensity;
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
			float shadowIntensity;
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
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
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
		return mix( 1.0, shadow, shadowIntensity );
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
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
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
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,uf=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
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
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,df=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,ff=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,pf=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,mf=`#ifdef USE_SKINNING
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
#endif`,gf=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,vf=`#ifdef USE_SKINNING
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
#endif`,yf=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,xf=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,_f=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,bf=`#ifndef saturate
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
vec3 CineonToneMapping( vec3 color ) {
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
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,Sf=`#ifdef USE_TRANSMISSION
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
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,Mf=`#ifdef USE_TRANSMISSION
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
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,Ef=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,wf=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Tf=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Rf=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const Cf=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Af=`uniform sampler2D t2D;
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
}`,Pf=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,If=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Df=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Lf=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Ff=`#include <common>
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
	#include <morphinstance_vertex>
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
}`,Uf=`#if DEPTH_PACKING == 3200
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
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
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
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,Bf=`#define DISTANCE
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
	#include <morphinstance_vertex>
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
}`,Nf=`#define DISTANCE
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
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,Of=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,zf=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,kf=`uniform float scale;
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
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Hf=`uniform vec3 diffuse;
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
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Vf=`#include <common>
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
	#include <morphinstance_vertex>
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
}`,Gf=`uniform vec3 diffuse;
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
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
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
}`,Wf=`#define LAMBERT
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
	#include <morphinstance_vertex>
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
}`,Xf=`#define LAMBERT
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
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
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
}`,qf=`#define MATCAP
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
	#include <morphinstance_vertex>
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
}`,$f=`#define MATCAP
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
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
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
}`,Yf=`#define NORMAL
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
	#include <morphinstance_vertex>
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
}`,Zf=`#define NORMAL
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
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,Kf=`#define PHONG
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
	#include <morphinstance_vertex>
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
}`,jf=`#define PHONG
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
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
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
}`,Qf=`#define STANDARD
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
	#include <morphinstance_vertex>
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
}`,Jf=`#define STANDARD
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
#ifdef USE_DISPERSION
	uniform float dispersion;
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
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
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
}`,ep=`#define TOON
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
	#include <morphinstance_vertex>
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
}`,tp=`#define TOON
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
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
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
}`,ip=`uniform float size;
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
	#include <morphinstance_vertex>
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
}`,np=`uniform vec3 diffuse;
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
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
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
}`,sp=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
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
}`,rp=`uniform vec3 color;
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
}`,ap=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
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
}`,op=`uniform vec3 diffuse;
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
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
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
}`,Be={alphahash_fragment:Cu,alphahash_pars_fragment:Au,alphamap_fragment:Pu,alphamap_pars_fragment:Iu,alphatest_fragment:Du,alphatest_pars_fragment:Lu,aomap_fragment:Fu,aomap_pars_fragment:Uu,batching_pars_vertex:Bu,batching_vertex:Nu,begin_vertex:Ou,beginnormal_vertex:zu,bsdfs:ku,iridescence_fragment:Hu,bumpmap_pars_fragment:Vu,clipping_planes_fragment:Gu,clipping_planes_pars_fragment:Wu,clipping_planes_pars_vertex:Xu,clipping_planes_vertex:qu,color_fragment:$u,color_pars_fragment:Yu,color_pars_vertex:Zu,color_vertex:Ku,common:ju,cube_uv_reflection_fragment:Qu,defaultnormal_vertex:Ju,displacementmap_pars_vertex:ed,displacementmap_vertex:td,emissivemap_fragment:id,emissivemap_pars_fragment:nd,colorspace_fragment:sd,colorspace_pars_fragment:rd,envmap_fragment:ad,envmap_common_pars_fragment:od,envmap_pars_fragment:ld,envmap_pars_vertex:cd,envmap_physical_pars_fragment:_d,envmap_vertex:hd,fog_vertex:ud,fog_pars_vertex:dd,fog_fragment:fd,fog_pars_fragment:pd,gradientmap_pars_fragment:md,lightmap_pars_fragment:gd,lights_lambert_fragment:vd,lights_lambert_pars_fragment:yd,lights_pars_begin:xd,lights_toon_fragment:bd,lights_toon_pars_fragment:Sd,lights_phong_fragment:Md,lights_phong_pars_fragment:Ed,lights_physical_fragment:wd,lights_physical_pars_fragment:Td,lights_fragment_begin:Rd,lights_fragment_maps:Cd,lights_fragment_end:Ad,logdepthbuf_fragment:Pd,logdepthbuf_pars_fragment:Id,logdepthbuf_pars_vertex:Dd,logdepthbuf_vertex:Ld,map_fragment:Fd,map_pars_fragment:Ud,map_particle_fragment:Bd,map_particle_pars_fragment:Nd,metalnessmap_fragment:Od,metalnessmap_pars_fragment:zd,morphinstance_vertex:kd,morphcolor_vertex:Hd,morphnormal_vertex:Vd,morphtarget_pars_vertex:Gd,morphtarget_vertex:Wd,normal_fragment_begin:Xd,normal_fragment_maps:qd,normal_pars_fragment:$d,normal_pars_vertex:Yd,normal_vertex:Zd,normalmap_pars_fragment:Kd,clearcoat_normal_fragment_begin:jd,clearcoat_normal_fragment_maps:Qd,clearcoat_pars_fragment:Jd,iridescence_pars_fragment:ef,opaque_fragment:tf,packing:nf,premultiplied_alpha_fragment:sf,project_vertex:rf,dithering_fragment:af,dithering_pars_fragment:of,roughnessmap_fragment:lf,roughnessmap_pars_fragment:cf,shadowmap_pars_fragment:hf,shadowmap_pars_vertex:uf,shadowmap_vertex:df,shadowmask_pars_fragment:ff,skinbase_vertex:pf,skinning_pars_vertex:mf,skinning_vertex:gf,skinnormal_vertex:vf,specularmap_fragment:yf,specularmap_pars_fragment:xf,tonemapping_fragment:_f,tonemapping_pars_fragment:bf,transmission_fragment:Sf,transmission_pars_fragment:Mf,uv_pars_fragment:Ef,uv_pars_vertex:wf,uv_vertex:Tf,worldpos_vertex:Rf,background_vert:Cf,background_frag:Af,backgroundCube_vert:Pf,backgroundCube_frag:If,cube_vert:Df,cube_frag:Lf,depth_vert:Ff,depth_frag:Uf,distanceRGBA_vert:Bf,distanceRGBA_frag:Nf,equirect_vert:Of,equirect_frag:zf,linedashed_vert:kf,linedashed_frag:Hf,meshbasic_vert:Vf,meshbasic_frag:Gf,meshlambert_vert:Wf,meshlambert_frag:Xf,meshmatcap_vert:qf,meshmatcap_frag:$f,meshnormal_vert:Yf,meshnormal_frag:Zf,meshphong_vert:Kf,meshphong_frag:jf,meshphysical_vert:Qf,meshphysical_frag:Jf,meshtoon_vert:ep,meshtoon_frag:tp,points_vert:ip,points_frag:np,shadow_vert:sp,shadow_frag:rp,sprite_vert:ap,sprite_frag:op},ne={common:{diffuse:{value:new Ae(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Fe},alphaMap:{value:null},alphaMapTransform:{value:new Fe},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Fe}},envmap:{envMap:{value:null},envMapRotation:{value:new Fe},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Fe}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Fe}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Fe},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Fe},normalScale:{value:new Te(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Fe},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Fe}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Fe}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Fe}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ae(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Ae(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Fe},alphaTest:{value:0},uvTransform:{value:new Fe}},sprite:{diffuse:{value:new Ae(16777215)},opacity:{value:1},center:{value:new Te(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Fe},alphaMap:{value:null},alphaMapTransform:{value:new Fe},alphaTest:{value:0}}},ri={basic:{uniforms:It([ne.common,ne.specularmap,ne.envmap,ne.aomap,ne.lightmap,ne.fog]),vertexShader:Be.meshbasic_vert,fragmentShader:Be.meshbasic_frag},lambert:{uniforms:It([ne.common,ne.specularmap,ne.envmap,ne.aomap,ne.lightmap,ne.emissivemap,ne.bumpmap,ne.normalmap,ne.displacementmap,ne.fog,ne.lights,{emissive:{value:new Ae(0)}}]),vertexShader:Be.meshlambert_vert,fragmentShader:Be.meshlambert_frag},phong:{uniforms:It([ne.common,ne.specularmap,ne.envmap,ne.aomap,ne.lightmap,ne.emissivemap,ne.bumpmap,ne.normalmap,ne.displacementmap,ne.fog,ne.lights,{emissive:{value:new Ae(0)},specular:{value:new Ae(1118481)},shininess:{value:30}}]),vertexShader:Be.meshphong_vert,fragmentShader:Be.meshphong_frag},standard:{uniforms:It([ne.common,ne.envmap,ne.aomap,ne.lightmap,ne.emissivemap,ne.bumpmap,ne.normalmap,ne.displacementmap,ne.roughnessmap,ne.metalnessmap,ne.fog,ne.lights,{emissive:{value:new Ae(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Be.meshphysical_vert,fragmentShader:Be.meshphysical_frag},toon:{uniforms:It([ne.common,ne.aomap,ne.lightmap,ne.emissivemap,ne.bumpmap,ne.normalmap,ne.displacementmap,ne.gradientmap,ne.fog,ne.lights,{emissive:{value:new Ae(0)}}]),vertexShader:Be.meshtoon_vert,fragmentShader:Be.meshtoon_frag},matcap:{uniforms:It([ne.common,ne.bumpmap,ne.normalmap,ne.displacementmap,ne.fog,{matcap:{value:null}}]),vertexShader:Be.meshmatcap_vert,fragmentShader:Be.meshmatcap_frag},points:{uniforms:It([ne.points,ne.fog]),vertexShader:Be.points_vert,fragmentShader:Be.points_frag},dashed:{uniforms:It([ne.common,ne.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Be.linedashed_vert,fragmentShader:Be.linedashed_frag},depth:{uniforms:It([ne.common,ne.displacementmap]),vertexShader:Be.depth_vert,fragmentShader:Be.depth_frag},normal:{uniforms:It([ne.common,ne.bumpmap,ne.normalmap,ne.displacementmap,{opacity:{value:1}}]),vertexShader:Be.meshnormal_vert,fragmentShader:Be.meshnormal_frag},sprite:{uniforms:It([ne.sprite,ne.fog]),vertexShader:Be.sprite_vert,fragmentShader:Be.sprite_frag},background:{uniforms:{uvTransform:{value:new Fe},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Be.background_vert,fragmentShader:Be.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Fe}},vertexShader:Be.backgroundCube_vert,fragmentShader:Be.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Be.cube_vert,fragmentShader:Be.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Be.equirect_vert,fragmentShader:Be.equirect_frag},distanceRGBA:{uniforms:It([ne.common,ne.displacementmap,{referencePosition:{value:new w},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Be.distanceRGBA_vert,fragmentShader:Be.distanceRGBA_frag},shadow:{uniforms:It([ne.lights,ne.fog,{color:{value:new Ae(0)},opacity:{value:1}}]),vertexShader:Be.shadow_vert,fragmentShader:Be.shadow_frag}};ri.physical={uniforms:It([ri.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Fe},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Fe},clearcoatNormalScale:{value:new Te(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Fe},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Fe},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Fe},sheen:{value:0},sheenColor:{value:new Ae(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Fe},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Fe},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Fe},transmissionSamplerSize:{value:new Te},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Fe},attenuationDistance:{value:0},attenuationColor:{value:new Ae(0)},specularColor:{value:new Ae(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Fe},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Fe},anisotropyVector:{value:new Te},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Fe}}]),vertexShader:Be.meshphysical_vert,fragmentShader:Be.meshphysical_frag};const Os={r:0,b:0,g:0},ki=new ni,lp=new Ke;function cp(s,e,t,i,n,r,a){const o=new Ae(0);let l=r===!0?0:1,c,h,d=null,f=0,p=null;function g(_){let x=_.isScene===!0?_.background:null;return x&&x.isTexture&&(x=(_.backgroundBlurriness>0?t:e).get(x)),x}function y(_){let x=!1;const T=g(_);T===null?u(o,l):T&&T.isColor&&(u(T,1),x=!0);const C=s.xr.getEnvironmentBlendMode();C==="additive"?i.buffers.color.setClear(0,0,0,1,a):C==="alpha-blend"&&i.buffers.color.setClear(0,0,0,0,a),(s.autoClear||x)&&(i.buffers.depth.setTest(!0),i.buffers.depth.setMask(!0),i.buffers.color.setMask(!0),s.clear(s.autoClearColor,s.autoClearDepth,s.autoClearStencil))}function m(_,x){const T=g(x);T&&(T.isCubeTexture||T.mapping===sr)?(h===void 0&&(h=new at(new os(1,1,1),new dt({name:"BackgroundCubeMaterial",uniforms:Ln(ri.backgroundCube.uniforms),vertexShader:ri.backgroundCube.vertexShader,fragmentShader:ri.backgroundCube.fragmentShader,side:Ut,depthTest:!1,depthWrite:!1,fog:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(C,A,P){this.matrixWorld.copyPosition(P.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(h)),ki.copy(x.backgroundRotation),ki.x*=-1,ki.y*=-1,ki.z*=-1,T.isCubeTexture&&T.isRenderTargetTexture===!1&&(ki.y*=-1,ki.z*=-1),h.material.uniforms.envMap.value=T,h.material.uniforms.flipEnvMap.value=T.isCubeTexture&&T.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=x.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=x.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(lp.makeRotationFromEuler(ki)),h.material.toneMapped=Ye.getTransfer(T.colorSpace)!==tt,(d!==T||f!==T.version||p!==s.toneMapping)&&(h.material.needsUpdate=!0,d=T,f=T.version,p=s.toneMapping),h.layers.enableAll(),_.unshift(h,h.geometry,h.material,0,0,null)):T&&T.isTexture&&(c===void 0&&(c=new at(new Yi(2,2),new dt({name:"BackgroundMaterial",uniforms:Ln(ri.background.uniforms),vertexShader:ri.background.vertexShader,fragmentShader:ri.background.fragmentShader,side:Li,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(c)),c.material.uniforms.t2D.value=T,c.material.uniforms.backgroundIntensity.value=x.backgroundIntensity,c.material.toneMapped=Ye.getTransfer(T.colorSpace)!==tt,T.matrixAutoUpdate===!0&&T.updateMatrix(),c.material.uniforms.uvTransform.value.copy(T.matrix),(d!==T||f!==T.version||p!==s.toneMapping)&&(c.material.needsUpdate=!0,d=T,f=T.version,p=s.toneMapping),c.layers.enableAll(),_.unshift(c,c.geometry,c.material,0,0,null))}function u(_,x){_.getRGB(Os,oc(s)),i.buffers.color.setClear(Os.r,Os.g,Os.b,x,a)}function v(){h!==void 0&&(h.geometry.dispose(),h.material.dispose()),c!==void 0&&(c.geometry.dispose(),c.material.dispose())}return{getClearColor:function(){return o},setClearColor:function(_,x=1){o.set(_),l=x,u(o,l)},getClearAlpha:function(){return l},setClearAlpha:function(_){l=_,u(o,l)},render:y,addToRenderList:m,dispose:v}}function hp(s,e){const t=s.getParameter(s.MAX_VERTEX_ATTRIBS),i={},n=f(null);let r=n,a=!1;function o(S,I,F,N,W){let $=!1;const X=d(N,F,I);r!==X&&(r=X,c(r.object)),$=p(S,N,F,W),$&&g(S,N,F,W),W!==null&&e.update(W,s.ELEMENT_ARRAY_BUFFER),($||a)&&(a=!1,x(S,I,F,N),W!==null&&s.bindBuffer(s.ELEMENT_ARRAY_BUFFER,e.get(W).buffer))}function l(){return s.createVertexArray()}function c(S){return s.bindVertexArray(S)}function h(S){return s.deleteVertexArray(S)}function d(S,I,F){const N=F.wireframe===!0;let W=i[S.id];W===void 0&&(W={},i[S.id]=W);let $=W[I.id];$===void 0&&($={},W[I.id]=$);let X=$[N];return X===void 0&&(X=f(l()),$[N]=X),X}function f(S){const I=[],F=[],N=[];for(let W=0;W<t;W++)I[W]=0,F[W]=0,N[W]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:I,enabledAttributes:F,attributeDivisors:N,object:S,attributes:{},index:null}}function p(S,I,F,N){const W=r.attributes,$=I.attributes;let X=0;const j=F.getAttributes();for(const G in j)if(j[G].location>=0){const de=W[G];let _e=$[G];if(_e===void 0&&(G==="instanceMatrix"&&S.instanceMatrix&&(_e=S.instanceMatrix),G==="instanceColor"&&S.instanceColor&&(_e=S.instanceColor)),de===void 0||de.attribute!==_e||_e&&de.data!==_e.data)return!0;X++}return r.attributesNum!==X||r.index!==N}function g(S,I,F,N){const W={},$=I.attributes;let X=0;const j=F.getAttributes();for(const G in j)if(j[G].location>=0){let de=$[G];de===void 0&&(G==="instanceMatrix"&&S.instanceMatrix&&(de=S.instanceMatrix),G==="instanceColor"&&S.instanceColor&&(de=S.instanceColor));const _e={};_e.attribute=de,de&&de.data&&(_e.data=de.data),W[G]=_e,X++}r.attributes=W,r.attributesNum=X,r.index=N}function y(){const S=r.newAttributes;for(let I=0,F=S.length;I<F;I++)S[I]=0}function m(S){u(S,0)}function u(S,I){const F=r.newAttributes,N=r.enabledAttributes,W=r.attributeDivisors;F[S]=1,N[S]===0&&(s.enableVertexAttribArray(S),N[S]=1),W[S]!==I&&(s.vertexAttribDivisor(S,I),W[S]=I)}function v(){const S=r.newAttributes,I=r.enabledAttributes;for(let F=0,N=I.length;F<N;F++)I[F]!==S[F]&&(s.disableVertexAttribArray(F),I[F]=0)}function _(S,I,F,N,W,$,X){X===!0?s.vertexAttribIPointer(S,I,F,W,$):s.vertexAttribPointer(S,I,F,N,W,$)}function x(S,I,F,N){y();const W=N.attributes,$=F.getAttributes(),X=I.defaultAttributeValues;for(const j in $){const G=$[j];if(G.location>=0){let ae=W[j];if(ae===void 0&&(j==="instanceMatrix"&&S.instanceMatrix&&(ae=S.instanceMatrix),j==="instanceColor"&&S.instanceColor&&(ae=S.instanceColor)),ae!==void 0){const de=ae.normalized,_e=ae.itemSize,Ne=e.get(ae);if(Ne===void 0)continue;const nt=Ne.buffer,Y=Ne.type,ie=Ne.bytesPerElement,ve=Y===s.INT||Y===s.UNSIGNED_INT||ae.gpuType===Oa;if(ae.isInterleavedBufferAttribute){const oe=ae.data,we=oe.stride,Pe=ae.offset;if(oe.isInstancedInterleavedBuffer){for(let Oe=0;Oe<G.locationSize;Oe++)u(G.location+Oe,oe.meshPerAttribute);S.isInstancedMesh!==!0&&N._maxInstanceCount===void 0&&(N._maxInstanceCount=oe.meshPerAttribute*oe.count)}else for(let Oe=0;Oe<G.locationSize;Oe++)m(G.location+Oe);s.bindBuffer(s.ARRAY_BUFFER,nt);for(let Oe=0;Oe<G.locationSize;Oe++)_(G.location+Oe,_e/G.locationSize,Y,de,we*ie,(Pe+_e/G.locationSize*Oe)*ie,ve)}else{if(ae.isInstancedBufferAttribute){for(let oe=0;oe<G.locationSize;oe++)u(G.location+oe,ae.meshPerAttribute);S.isInstancedMesh!==!0&&N._maxInstanceCount===void 0&&(N._maxInstanceCount=ae.meshPerAttribute*ae.count)}else for(let oe=0;oe<G.locationSize;oe++)m(G.location+oe);s.bindBuffer(s.ARRAY_BUFFER,nt);for(let oe=0;oe<G.locationSize;oe++)_(G.location+oe,_e/G.locationSize,Y,de,_e*ie,_e/G.locationSize*oe*ie,ve)}}else if(X!==void 0){const de=X[j];if(de!==void 0)switch(de.length){case 2:s.vertexAttrib2fv(G.location,de);break;case 3:s.vertexAttrib3fv(G.location,de);break;case 4:s.vertexAttrib4fv(G.location,de);break;default:s.vertexAttrib1fv(G.location,de)}}}}v()}function T(){P();for(const S in i){const I=i[S];for(const F in I){const N=I[F];for(const W in N)h(N[W].object),delete N[W];delete I[F]}delete i[S]}}function C(S){if(i[S.id]===void 0)return;const I=i[S.id];for(const F in I){const N=I[F];for(const W in N)h(N[W].object),delete N[W];delete I[F]}delete i[S.id]}function A(S){for(const I in i){const F=i[I];if(F[S.id]===void 0)continue;const N=F[S.id];for(const W in N)h(N[W].object),delete N[W];delete F[S.id]}}function P(){M(),a=!0,r!==n&&(r=n,c(r.object))}function M(){n.geometry=null,n.program=null,n.wireframe=!1}return{setup:o,reset:P,resetDefaultState:M,dispose:T,releaseStatesOfGeometry:C,releaseStatesOfProgram:A,initAttributes:y,enableAttribute:m,disableUnusedAttributes:v}}function up(s,e,t){let i;function n(c){i=c}function r(c,h){s.drawArrays(i,c,h),t.update(h,i,1)}function a(c,h,d){d!==0&&(s.drawArraysInstanced(i,c,h,d),t.update(h,i,d))}function o(c,h,d){if(d===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,c,0,h,0,d);let p=0;for(let g=0;g<d;g++)p+=h[g];t.update(p,i,1)}function l(c,h,d,f){if(d===0)return;const p=e.get("WEBGL_multi_draw");if(p===null)for(let g=0;g<c.length;g++)a(c[g],h[g],f[g]);else{p.multiDrawArraysInstancedWEBGL(i,c,0,h,0,f,0,d);let g=0;for(let y=0;y<d;y++)g+=h[y]*f[y];t.update(g,i,1)}}this.setMode=n,this.render=r,this.renderInstances=a,this.renderMultiDraw=o,this.renderMultiDrawInstances=l}function dp(s,e,t,i){let n;function r(){if(n!==void 0)return n;if(e.has("EXT_texture_filter_anisotropic")===!0){const A=e.get("EXT_texture_filter_anisotropic");n=s.getParameter(A.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else n=0;return n}function a(A){return!(A!==Zt&&i.convert(A)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(A){const P=A===as&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(A!==_i&&i.convert(A)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_TYPE)&&A!==ai&&!P)}function l(A){if(A==="highp"){if(s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.HIGH_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.HIGH_FLOAT).precision>0)return"highp";A="mediump"}return A==="mediump"&&s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.MEDIUM_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp";const h=l(c);h!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);const d=t.logarithmicDepthBuffer===!0,f=t.reverseDepthBuffer===!0&&e.has("EXT_clip_control"),p=s.getParameter(s.MAX_TEXTURE_IMAGE_UNITS),g=s.getParameter(s.MAX_VERTEX_TEXTURE_IMAGE_UNITS),y=s.getParameter(s.MAX_TEXTURE_SIZE),m=s.getParameter(s.MAX_CUBE_MAP_TEXTURE_SIZE),u=s.getParameter(s.MAX_VERTEX_ATTRIBS),v=s.getParameter(s.MAX_VERTEX_UNIFORM_VECTORS),_=s.getParameter(s.MAX_VARYING_VECTORS),x=s.getParameter(s.MAX_FRAGMENT_UNIFORM_VECTORS),T=g>0,C=s.getParameter(s.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:d,reverseDepthBuffer:f,maxTextures:p,maxVertexTextures:g,maxTextureSize:y,maxCubemapSize:m,maxAttributes:u,maxVertexUniforms:v,maxVaryings:_,maxFragmentUniforms:x,vertexTextures:T,maxSamples:C}}function fp(s){const e=this;let t=null,i=0,n=!1,r=!1;const a=new Ci,o=new Fe,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(d,f){const p=d.length!==0||f||i!==0||n;return n=f,i=d.length,p},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(d,f){t=h(d,f,0)},this.setState=function(d,f,p){const g=d.clippingPlanes,y=d.clipIntersection,m=d.clipShadows,u=s.get(d);if(!n||g===null||g.length===0||r&&!m)r?h(null):c();else{const v=r?0:i,_=v*4;let x=u.clippingState||null;l.value=x,x=h(g,f,_,p);for(let T=0;T!==_;++T)x[T]=t[T];u.clippingState=x,this.numIntersection=y?this.numPlanes:0,this.numPlanes+=v}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function h(d,f,p,g){const y=d!==null?d.length:0;let m=null;if(y!==0){if(m=l.value,g!==!0||m===null){const u=p+y*4,v=f.matrixWorldInverse;o.getNormalMatrix(v),(m===null||m.length<u)&&(m=new Float32Array(u));for(let _=0,x=p;_!==y;++_,x+=4)a.copy(d[_]).applyMatrix4(v,o),a.normal.toArray(m,x),m[x+3]=a.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=y,e.numIntersection=0,m}}function pp(s){let e=new WeakMap;function t(a,o){return o===ia?a.mapping=Cn:o===na&&(a.mapping=An),a}function i(a){if(a&&a.isTexture){const o=a.mapping;if(o===ia||o===na)if(e.has(a)){const l=e.get(a).texture;return t(l,a.mapping)}else{const l=a.image;if(l&&l.height>0){const c=new su(l.height);return c.fromEquirectangularTexture(s,a),e.set(a,c),a.addEventListener("dispose",n),t(c.texture,a.mapping)}else return null}}return a}function n(a){const o=a.target;o.removeEventListener("dispose",n);const l=e.get(o);l!==void 0&&(e.delete(o),l.dispose())}function r(){e=new WeakMap}return{get:i,dispose:r}}const Sn=4,tl=[.125,.215,.35,.446,.526,.582],Xi=20,Or=new Su,il=new Ae;let zr=null,kr=0,Hr=0,Vr=!1;const Gi=(1+Math.sqrt(5))/2,xn=1/Gi,nl=[new w(-Gi,xn,0),new w(Gi,xn,0),new w(-xn,0,Gi),new w(xn,0,Gi),new w(0,Gi,-xn),new w(0,Gi,xn),new w(-1,1,-1),new w(1,1,-1),new w(-1,1,1),new w(1,1,1)];class sl{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,i=.1,n=100){zr=this._renderer.getRenderTarget(),kr=this._renderer.getActiveCubeFace(),Hr=this._renderer.getActiveMipmapLevel(),Vr=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const r=this._allocateTargets();return r.depthBuffer=!0,this._sceneToCubeUV(e,i,n,r),t>0&&this._blur(r,0,0,t),this._applyPMREM(r),this._cleanup(r),r}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=ol(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=al(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(zr,kr,Hr),this._renderer.xr.enabled=Vr,e.scissorTest=!1,zs(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Cn||e.mapping===An?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),zr=this._renderer.getRenderTarget(),kr=this._renderer.getActiveCubeFace(),Hr=this._renderer.getActiveMipmapLevel(),Vr=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const i=t||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:Ht,minFilter:Ht,generateMipmaps:!1,type:as,format:Zt,colorSpace:Dn,depthBuffer:!1},n=rl(e,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=rl(e,t,i);const{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=mp(r)),this._blurMaterial=gp(r,e,t)}return n}_compileMaterial(e){const t=new at(this._lodPlanes[0],e);this._renderer.compile(t,Or)}_sceneToCubeUV(e,t,i,n){const o=new kt(90,1,t,i),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],h=this._renderer,d=h.autoClear,f=h.toneMapping;h.getClearColor(il),h.toneMapping=Di,h.autoClear=!1;const p=new Tn({name:"PMREM.Background",side:Ut,depthWrite:!1,depthTest:!1}),g=new at(new os,p);let y=!1;const m=e.background;m?m.isColor&&(p.color.copy(m),e.background=null,y=!0):(p.color.copy(il),y=!0);for(let u=0;u<6;u++){const v=u%3;v===0?(o.up.set(0,l[u],0),o.lookAt(c[u],0,0)):v===1?(o.up.set(0,0,l[u]),o.lookAt(0,c[u],0)):(o.up.set(0,l[u],0),o.lookAt(0,0,c[u]));const _=this._cubeSize;zs(n,v*_,u>2?_:0,_,_),h.setRenderTarget(n),y&&h.render(g,o),h.render(e,o)}g.geometry.dispose(),g.material.dispose(),h.toneMapping=f,h.autoClear=d,e.background=m}_textureToCubeUV(e,t){const i=this._renderer,n=e.mapping===Cn||e.mapping===An;n?(this._cubemapMaterial===null&&(this._cubemapMaterial=ol()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=al());const r=n?this._cubemapMaterial:this._equirectMaterial,a=new at(this._lodPlanes[0],r),o=r.uniforms;o.envMap.value=e;const l=this._cubeSize;zs(t,0,0,3*l,2*l),i.setRenderTarget(t),i.render(a,Or)}_applyPMREM(e){const t=this._renderer,i=t.autoClear;t.autoClear=!1;const n=this._lodPlanes.length;for(let r=1;r<n;r++){const a=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),o=nl[(n-r-1)%nl.length];this._blur(e,r-1,r,a,o)}t.autoClear=i}_blur(e,t,i,n,r){const a=this._pingPongRenderTarget;this._halfBlur(e,a,t,i,n,"latitudinal",r),this._halfBlur(a,e,i,i,n,"longitudinal",r)}_halfBlur(e,t,i,n,r,a,o){const l=this._renderer,c=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const h=3,d=new at(this._lodPlanes[n],c),f=c.uniforms,p=this._sizeLods[i]-1,g=isFinite(r)?Math.PI/(2*p):2*Math.PI/(2*Xi-1),y=r/g,m=isFinite(r)?1+Math.floor(h*y):Xi;m>Xi&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${Xi}`);const u=[];let v=0;for(let A=0;A<Xi;++A){const P=A/y,M=Math.exp(-P*P/2);u.push(M),A===0?v+=M:A<m&&(v+=2*M)}for(let A=0;A<u.length;A++)u[A]=u[A]/v;f.envMap.value=e.texture,f.samples.value=m,f.weights.value=u,f.latitudinal.value=a==="latitudinal",o&&(f.poleAxis.value=o);const{_lodMax:_}=this;f.dTheta.value=g,f.mipInt.value=_-i;const x=this._sizeLods[n],T=3*x*(n>_-Sn?n-_+Sn:0),C=4*(this._cubeSize-x);zs(t,T,C,3*x,2*x),l.setRenderTarget(t),l.render(d,Or)}}function mp(s){const e=[],t=[],i=[];let n=s;const r=s-Sn+1+tl.length;for(let a=0;a<r;a++){const o=Math.pow(2,n);t.push(o);let l=1/o;a>s-Sn?l=tl[a-s+Sn-1]:a===0&&(l=0),i.push(l);const c=1/(o-2),h=-c,d=1+c,f=[h,h,d,h,d,d,h,h,d,d,h,d],p=6,g=6,y=3,m=2,u=1,v=new Float32Array(y*g*p),_=new Float32Array(m*g*p),x=new Float32Array(u*g*p);for(let C=0;C<p;C++){const A=C%3*2/3-1,P=C>2?0:-1,M=[A,P,0,A+2/3,P,0,A+2/3,P+1,0,A,P,0,A+2/3,P+1,0,A,P+1,0];v.set(M,y*g*C),_.set(f,m*g*C);const S=[C,C,C,C,C,C];x.set(S,u*g*C)}const T=new vt;T.setAttribute("position",new lt(v,y)),T.setAttribute("uv",new lt(_,m)),T.setAttribute("faceIndex",new lt(x,u)),e.push(T),n>Sn&&n--}return{lodPlanes:e,sizeLods:t,sigmas:i}}function rl(s,e,t){const i=new Ki(s,e,t);return i.texture.mapping=sr,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function zs(s,e,t,i,n){s.viewport.set(e,t,i,n),s.scissor.set(e,t,i,n)}function gp(s,e,t){const i=new Float32Array(Xi),n=new w(0,1,0);return new dt({name:"SphericalGaussianBlur",defines:{n:Xi,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:n}},vertexShader:Ja(),fragmentShader:`

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
		`,blending:Ii,depthTest:!1,depthWrite:!1})}function al(){return new dt({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Ja(),fragmentShader:`

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
		`,blending:Ii,depthTest:!1,depthWrite:!1})}function ol(){return new dt({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Ja(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Ii,depthTest:!1,depthWrite:!1})}function Ja(){return`

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
	`}function vp(s){let e=new WeakMap,t=null;function i(o){if(o&&o.isTexture){const l=o.mapping,c=l===ia||l===na,h=l===Cn||l===An;if(c||h){let d=e.get(o);const f=d!==void 0?d.texture.pmremVersion:0;if(o.isRenderTargetTexture&&o.pmremVersion!==f)return t===null&&(t=new sl(s)),d=c?t.fromEquirectangular(o,d):t.fromCubemap(o,d),d.texture.pmremVersion=o.pmremVersion,e.set(o,d),d.texture;if(d!==void 0)return d.texture;{const p=o.image;return c&&p&&p.height>0||h&&p&&n(p)?(t===null&&(t=new sl(s)),d=c?t.fromEquirectangular(o):t.fromCubemap(o),d.texture.pmremVersion=o.pmremVersion,e.set(o,d),o.addEventListener("dispose",r),d.texture):null}}}return o}function n(o){let l=0;const c=6;for(let h=0;h<c;h++)o[h]!==void 0&&l++;return l===c}function r(o){const l=o.target;l.removeEventListener("dispose",r);const c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function a(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:i,dispose:a}}function yp(s){const e={};function t(i){if(e[i]!==void 0)return e[i];let n;switch(i){case"WEBGL_depth_texture":n=s.getExtension("WEBGL_depth_texture")||s.getExtension("MOZ_WEBGL_depth_texture")||s.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":n=s.getExtension("EXT_texture_filter_anisotropic")||s.getExtension("MOZ_EXT_texture_filter_anisotropic")||s.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":n=s.getExtension("WEBGL_compressed_texture_s3tc")||s.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||s.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":n=s.getExtension("WEBGL_compressed_texture_pvrtc")||s.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:n=s.getExtension(i)}return e[i]=n,n}return{has:function(i){return t(i)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(i){const n=t(i);return n===null&&bn("THREE.WebGLRenderer: "+i+" extension not supported."),n}}}function xp(s,e,t,i){const n={},r=new WeakMap;function a(d){const f=d.target;f.index!==null&&e.remove(f.index);for(const g in f.attributes)e.remove(f.attributes[g]);f.removeEventListener("dispose",a),delete n[f.id];const p=r.get(f);p&&(e.remove(p),r.delete(f)),i.releaseStatesOfGeometry(f),f.isInstancedBufferGeometry===!0&&delete f._maxInstanceCount,t.memory.geometries--}function o(d,f){return n[f.id]===!0||(f.addEventListener("dispose",a),n[f.id]=!0,t.memory.geometries++),f}function l(d){const f=d.attributes;for(const p in f)e.update(f[p],s.ARRAY_BUFFER)}function c(d){const f=[],p=d.index,g=d.attributes.position;let y=0;if(p!==null){const v=p.array;y=p.version;for(let _=0,x=v.length;_<x;_+=3){const T=v[_+0],C=v[_+1],A=v[_+2];f.push(T,C,C,A,A,T)}}else if(g!==void 0){const v=g.array;y=g.version;for(let _=0,x=v.length/3-1;_<x;_+=3){const T=_+0,C=_+1,A=_+2;f.push(T,C,C,A,A,T)}}else return;const m=new(tc(f)?ac:rc)(f,1);m.version=y;const u=r.get(d);u&&e.remove(u),r.set(d,m)}function h(d){const f=r.get(d);if(f){const p=d.index;p!==null&&f.version<p.version&&c(d)}else c(d);return r.get(d)}return{get:o,update:l,getWireframeAttribute:h}}function _p(s,e,t){let i;function n(f){i=f}let r,a;function o(f){r=f.type,a=f.bytesPerElement}function l(f,p){s.drawElements(i,p,r,f*a),t.update(p,i,1)}function c(f,p,g){g!==0&&(s.drawElementsInstanced(i,p,r,f*a,g),t.update(p,i,g))}function h(f,p,g){if(g===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,p,0,r,f,0,g);let m=0;for(let u=0;u<g;u++)m+=p[u];t.update(m,i,1)}function d(f,p,g,y){if(g===0)return;const m=e.get("WEBGL_multi_draw");if(m===null)for(let u=0;u<f.length;u++)c(f[u]/a,p[u],y[u]);else{m.multiDrawElementsInstancedWEBGL(i,p,0,r,f,0,y,0,g);let u=0;for(let v=0;v<g;v++)u+=p[v]*y[v];t.update(u,i,1)}}this.setMode=n,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=h,this.renderMultiDrawInstances=d}function bp(s){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(r,a,o){switch(t.calls++,a){case s.TRIANGLES:t.triangles+=o*(r/3);break;case s.LINES:t.lines+=o*(r/2);break;case s.LINE_STRIP:t.lines+=o*(r-1);break;case s.LINE_LOOP:t.lines+=o*r;break;case s.POINTS:t.points+=o*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",a);break}}function n(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:n,update:i}}function Sp(s,e,t){const i=new WeakMap,n=new it;function r(a,o,l){const c=a.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,d=h!==void 0?h.length:0;let f=i.get(o);if(f===void 0||f.count!==d){let S=function(){P.dispose(),i.delete(o),o.removeEventListener("dispose",S)};var p=S;f!==void 0&&f.texture.dispose();const g=o.morphAttributes.position!==void 0,y=o.morphAttributes.normal!==void 0,m=o.morphAttributes.color!==void 0,u=o.morphAttributes.position||[],v=o.morphAttributes.normal||[],_=o.morphAttributes.color||[];let x=0;g===!0&&(x=1),y===!0&&(x=2),m===!0&&(x=3);let T=o.attributes.position.count*x,C=1;T>e.maxTextureSize&&(C=Math.ceil(T/e.maxTextureSize),T=e.maxTextureSize);const A=new Float32Array(T*C*4*d),P=new nc(A,T,C,d);P.type=ai,P.needsUpdate=!0;const M=x*4;for(let I=0;I<d;I++){const F=u[I],N=v[I],W=_[I],$=T*C*4*I;for(let X=0;X<F.count;X++){const j=X*M;g===!0&&(n.fromBufferAttribute(F,X),A[$+j+0]=n.x,A[$+j+1]=n.y,A[$+j+2]=n.z,A[$+j+3]=0),y===!0&&(n.fromBufferAttribute(N,X),A[$+j+4]=n.x,A[$+j+5]=n.y,A[$+j+6]=n.z,A[$+j+7]=0),m===!0&&(n.fromBufferAttribute(W,X),A[$+j+8]=n.x,A[$+j+9]=n.y,A[$+j+10]=n.z,A[$+j+11]=W.itemSize===4?n.w:1)}}f={count:d,texture:P,size:new Te(T,C)},i.set(o,f),o.addEventListener("dispose",S)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(s,"morphTexture",a.morphTexture,t);else{let g=0;for(let m=0;m<c.length;m++)g+=c[m];const y=o.morphTargetsRelative?1:1-g;l.getUniforms().setValue(s,"morphTargetBaseInfluence",y),l.getUniforms().setValue(s,"morphTargetInfluences",c)}l.getUniforms().setValue(s,"morphTargetsTexture",f.texture,t),l.getUniforms().setValue(s,"morphTargetsTextureSize",f.size)}return{update:r}}function Mp(s,e,t,i){let n=new WeakMap;function r(l){const c=i.render.frame,h=l.geometry,d=e.get(l,h);if(n.get(d)!==c&&(e.update(d),n.set(d,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",o)===!1&&l.addEventListener("dispose",o),n.get(l)!==c&&(t.update(l.instanceMatrix,s.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,s.ARRAY_BUFFER),n.set(l,c))),l.isSkinnedMesh){const f=l.skeleton;n.get(f)!==c&&(f.update(),n.set(f,c))}return d}function a(){n=new WeakMap}function o(l){const c=l.target;c.removeEventListener("dispose",o),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:r,dispose:a}}const mc=new Mt,ll=new dc(1,1),gc=new nc,vc=new Vh,yc=new cc,cl=[],hl=[],ul=new Float32Array(16),dl=new Float32Array(9),fl=new Float32Array(4);function Bn(s,e,t){const i=s[0];if(i<=0||i>0)return s;const n=e*t;let r=cl[n];if(r===void 0&&(r=new Float32Array(n),cl[n]=r),e!==0){i.toArray(r,0);for(let a=1,o=0;a!==e;++a)o+=t,s[a].toArray(r,o)}return r}function yt(s,e){if(s.length!==e.length)return!1;for(let t=0,i=s.length;t<i;t++)if(s[t]!==e[t])return!1;return!0}function xt(s,e){for(let t=0,i=e.length;t<i;t++)s[t]=e[t]}function or(s,e){let t=hl[e];t===void 0&&(t=new Int32Array(e),hl[e]=t);for(let i=0;i!==e;++i)t[i]=s.allocateTextureUnit();return t}function Ep(s,e){const t=this.cache;t[0]!==e&&(s.uniform1f(this.addr,e),t[0]=e)}function wp(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(yt(t,e))return;s.uniform2fv(this.addr,e),xt(t,e)}}function Tp(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(s.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(yt(t,e))return;s.uniform3fv(this.addr,e),xt(t,e)}}function Rp(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(yt(t,e))return;s.uniform4fv(this.addr,e),xt(t,e)}}function Cp(s,e){const t=this.cache,i=e.elements;if(i===void 0){if(yt(t,e))return;s.uniformMatrix2fv(this.addr,!1,e),xt(t,e)}else{if(yt(t,i))return;fl.set(i),s.uniformMatrix2fv(this.addr,!1,fl),xt(t,i)}}function Ap(s,e){const t=this.cache,i=e.elements;if(i===void 0){if(yt(t,e))return;s.uniformMatrix3fv(this.addr,!1,e),xt(t,e)}else{if(yt(t,i))return;dl.set(i),s.uniformMatrix3fv(this.addr,!1,dl),xt(t,i)}}function Pp(s,e){const t=this.cache,i=e.elements;if(i===void 0){if(yt(t,e))return;s.uniformMatrix4fv(this.addr,!1,e),xt(t,e)}else{if(yt(t,i))return;ul.set(i),s.uniformMatrix4fv(this.addr,!1,ul),xt(t,i)}}function Ip(s,e){const t=this.cache;t[0]!==e&&(s.uniform1i(this.addr,e),t[0]=e)}function Dp(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(yt(t,e))return;s.uniform2iv(this.addr,e),xt(t,e)}}function Lp(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(yt(t,e))return;s.uniform3iv(this.addr,e),xt(t,e)}}function Fp(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(yt(t,e))return;s.uniform4iv(this.addr,e),xt(t,e)}}function Up(s,e){const t=this.cache;t[0]!==e&&(s.uniform1ui(this.addr,e),t[0]=e)}function Bp(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(yt(t,e))return;s.uniform2uiv(this.addr,e),xt(t,e)}}function Np(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(yt(t,e))return;s.uniform3uiv(this.addr,e),xt(t,e)}}function Op(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(yt(t,e))return;s.uniform4uiv(this.addr,e),xt(t,e)}}function zp(s,e,t){const i=this.cache,n=t.allocateTextureUnit();i[0]!==n&&(s.uniform1i(this.addr,n),i[0]=n);let r;this.type===s.SAMPLER_2D_SHADOW?(ll.compareFunction=ec,r=ll):r=mc,t.setTexture2D(e||r,n)}function kp(s,e,t){const i=this.cache,n=t.allocateTextureUnit();i[0]!==n&&(s.uniform1i(this.addr,n),i[0]=n),t.setTexture3D(e||vc,n)}function Hp(s,e,t){const i=this.cache,n=t.allocateTextureUnit();i[0]!==n&&(s.uniform1i(this.addr,n),i[0]=n),t.setTextureCube(e||yc,n)}function Vp(s,e,t){const i=this.cache,n=t.allocateTextureUnit();i[0]!==n&&(s.uniform1i(this.addr,n),i[0]=n),t.setTexture2DArray(e||gc,n)}function Gp(s){switch(s){case 5126:return Ep;case 35664:return wp;case 35665:return Tp;case 35666:return Rp;case 35674:return Cp;case 35675:return Ap;case 35676:return Pp;case 5124:case 35670:return Ip;case 35667:case 35671:return Dp;case 35668:case 35672:return Lp;case 35669:case 35673:return Fp;case 5125:return Up;case 36294:return Bp;case 36295:return Np;case 36296:return Op;case 35678:case 36198:case 36298:case 36306:case 35682:return zp;case 35679:case 36299:case 36307:return kp;case 35680:case 36300:case 36308:case 36293:return Hp;case 36289:case 36303:case 36311:case 36292:return Vp}}function Wp(s,e){s.uniform1fv(this.addr,e)}function Xp(s,e){const t=Bn(e,this.size,2);s.uniform2fv(this.addr,t)}function qp(s,e){const t=Bn(e,this.size,3);s.uniform3fv(this.addr,t)}function $p(s,e){const t=Bn(e,this.size,4);s.uniform4fv(this.addr,t)}function Yp(s,e){const t=Bn(e,this.size,4);s.uniformMatrix2fv(this.addr,!1,t)}function Zp(s,e){const t=Bn(e,this.size,9);s.uniformMatrix3fv(this.addr,!1,t)}function Kp(s,e){const t=Bn(e,this.size,16);s.uniformMatrix4fv(this.addr,!1,t)}function jp(s,e){s.uniform1iv(this.addr,e)}function Qp(s,e){s.uniform2iv(this.addr,e)}function Jp(s,e){s.uniform3iv(this.addr,e)}function em(s,e){s.uniform4iv(this.addr,e)}function tm(s,e){s.uniform1uiv(this.addr,e)}function im(s,e){s.uniform2uiv(this.addr,e)}function nm(s,e){s.uniform3uiv(this.addr,e)}function sm(s,e){s.uniform4uiv(this.addr,e)}function rm(s,e,t){const i=this.cache,n=e.length,r=or(t,n);yt(i,r)||(s.uniform1iv(this.addr,r),xt(i,r));for(let a=0;a!==n;++a)t.setTexture2D(e[a]||mc,r[a])}function am(s,e,t){const i=this.cache,n=e.length,r=or(t,n);yt(i,r)||(s.uniform1iv(this.addr,r),xt(i,r));for(let a=0;a!==n;++a)t.setTexture3D(e[a]||vc,r[a])}function om(s,e,t){const i=this.cache,n=e.length,r=or(t,n);yt(i,r)||(s.uniform1iv(this.addr,r),xt(i,r));for(let a=0;a!==n;++a)t.setTextureCube(e[a]||yc,r[a])}function lm(s,e,t){const i=this.cache,n=e.length,r=or(t,n);yt(i,r)||(s.uniform1iv(this.addr,r),xt(i,r));for(let a=0;a!==n;++a)t.setTexture2DArray(e[a]||gc,r[a])}function cm(s){switch(s){case 5126:return Wp;case 35664:return Xp;case 35665:return qp;case 35666:return $p;case 35674:return Yp;case 35675:return Zp;case 35676:return Kp;case 5124:case 35670:return jp;case 35667:case 35671:return Qp;case 35668:case 35672:return Jp;case 35669:case 35673:return em;case 5125:return tm;case 36294:return im;case 36295:return nm;case 36296:return sm;case 35678:case 36198:case 36298:case 36306:case 35682:return rm;case 35679:case 36299:case 36307:return am;case 35680:case 36300:case 36308:case 36293:return om;case 36289:case 36303:case 36311:case 36292:return lm}}class hm{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.setValue=Gp(t.type)}}class um{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=cm(t.type)}}class dm{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){const n=this.seq;for(let r=0,a=n.length;r!==a;++r){const o=n[r];o.setValue(e,t[o.id],i)}}}const Gr=/(\w+)(\])?(\[|\.)?/g;function pl(s,e){s.seq.push(e),s.map[e.id]=e}function fm(s,e,t){const i=s.name,n=i.length;for(Gr.lastIndex=0;;){const r=Gr.exec(i),a=Gr.lastIndex;let o=r[1];const l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===n){pl(t,c===void 0?new hm(o,s,e):new um(o,s,e));break}else{let d=t.map[o];d===void 0&&(d=new dm(o),pl(t,d)),t=d}}}class Ys{constructor(e,t){this.seq=[],this.map={};const i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let n=0;n<i;++n){const r=e.getActiveUniform(t,n),a=e.getUniformLocation(t,r.name);fm(r,a,this)}}setValue(e,t,i,n){const r=this.map[t];r!==void 0&&r.setValue(e,i,n)}setOptional(e,t,i){const n=t[i];n!==void 0&&this.setValue(e,i,n)}static upload(e,t,i,n){for(let r=0,a=t.length;r!==a;++r){const o=t[r],l=i[o.id];l.needsUpdate!==!1&&o.setValue(e,l.value,n)}}static seqWithValue(e,t){const i=[];for(let n=0,r=e.length;n!==r;++n){const a=e[n];a.id in t&&i.push(a)}return i}}function ml(s,e,t){const i=s.createShader(e);return s.shaderSource(i,t),s.compileShader(i),i}const pm=37297;let mm=0;function gm(s,e){const t=s.split(`
`),i=[],n=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let a=n;a<r;a++){const o=a+1;i.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return i.join(`
`)}const gl=new Fe;function vm(s){Ye._getMatrix(gl,Ye.workingColorSpace,s);const e=`mat3( ${gl.elements.map(t=>t.toFixed(4))} )`;switch(Ye.getTransfer(s)){case Ks:return[e,"LinearTransferOETF"];case tt:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",s),[e,"LinearTransferOETF"]}}function vl(s,e,t){const i=s.getShaderParameter(e,s.COMPILE_STATUS),n=s.getShaderInfoLog(e).trim();if(i&&n==="")return"";const r=/ERROR: 0:(\d+)/.exec(n);if(r){const a=parseInt(r[1]);return t.toUpperCase()+`

`+n+`

`+gm(s.getShaderSource(e),a)}else return n}function ym(s,e){const t=vm(e);return[`vec4 ${s}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function xm(s,e){let t;switch(e){case eh:t="Linear";break;case th:t="Reinhard";break;case ih:t="Cineon";break;case Gl:t="ACESFilmic";break;case sh:t="AgX";break;case rh:t="Neutral";break;case nh:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+s+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const ks=new w;function _m(){Ye.getLuminanceCoefficients(ks);const s=ks.x.toFixed(4),e=ks.y.toFixed(4),t=ks.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${s}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function bm(s){return[s.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",s.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(jn).join(`
`)}function Sm(s){const e=[];for(const t in s){const i=s[t];i!==!1&&e.push("#define "+t+" "+i)}return e.join(`
`)}function Mm(s,e){const t={},i=s.getProgramParameter(e,s.ACTIVE_ATTRIBUTES);for(let n=0;n<i;n++){const r=s.getActiveAttrib(e,n),a=r.name;let o=1;r.type===s.FLOAT_MAT2&&(o=2),r.type===s.FLOAT_MAT3&&(o=3),r.type===s.FLOAT_MAT4&&(o=4),t[a]={type:r.type,location:s.getAttribLocation(e,a),locationSize:o}}return t}function jn(s){return s!==""}function yl(s,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return s.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function xl(s,e){return s.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const Em=/^[ \t]*#include +<([\w\d./]+)>/gm;function Fa(s){return s.replace(Em,Tm)}const wm=new Map;function Tm(s,e){let t=Be[e];if(t===void 0){const i=wm.get(e);if(i!==void 0)t=Be[i],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("Can not resolve #include <"+e+">")}return Fa(t)}const Rm=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function _l(s){return s.replace(Rm,Cm)}function Cm(s,e,t,i){let n="";for(let r=parseInt(e);r<parseInt(t);r++)n+=i.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return n}function bl(s){let e=`precision ${s.precision} float;
	precision ${s.precision} int;
	precision ${s.precision} sampler2D;
	precision ${s.precision} samplerCube;
	precision ${s.precision} sampler3D;
	precision ${s.precision} sampler2DArray;
	precision ${s.precision} sampler2DShadow;
	precision ${s.precision} samplerCubeShadow;
	precision ${s.precision} sampler2DArrayShadow;
	precision ${s.precision} isampler2D;
	precision ${s.precision} isampler3D;
	precision ${s.precision} isamplerCube;
	precision ${s.precision} isampler2DArray;
	precision ${s.precision} usampler2D;
	precision ${s.precision} usampler3D;
	precision ${s.precision} usamplerCube;
	precision ${s.precision} usampler2DArray;
	`;return s.precision==="highp"?e+=`
#define HIGH_PRECISION`:s.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:s.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function Am(s){let e="SHADOWMAP_TYPE_BASIC";return s.shadowMapType===Vl?e="SHADOWMAP_TYPE_PCF":s.shadowMapType===Lc?e="SHADOWMAP_TYPE_PCF_SOFT":s.shadowMapType===pi&&(e="SHADOWMAP_TYPE_VSM"),e}function Pm(s){let e="ENVMAP_TYPE_CUBE";if(s.envMap)switch(s.envMapMode){case Cn:case An:e="ENVMAP_TYPE_CUBE";break;case sr:e="ENVMAP_TYPE_CUBE_UV";break}return e}function Im(s){let e="ENVMAP_MODE_REFLECTION";if(s.envMap)switch(s.envMapMode){case An:e="ENVMAP_MODE_REFRACTION";break}return e}function Dm(s){let e="ENVMAP_BLENDING_NONE";if(s.envMap)switch(s.combine){case Na:e="ENVMAP_BLENDING_MULTIPLY";break;case Qc:e="ENVMAP_BLENDING_MIX";break;case Jc:e="ENVMAP_BLENDING_ADD";break}return e}function Lm(s){const e=s.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:i,maxMip:t}}function Fm(s,e,t,i){const n=s.getContext(),r=t.defines;let a=t.vertexShader,o=t.fragmentShader;const l=Am(t),c=Pm(t),h=Im(t),d=Dm(t),f=Lm(t),p=bm(t),g=Sm(r),y=n.createProgram();let m,u,v=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(jn).join(`
`),m.length>0&&(m+=`
`),u=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(jn).join(`
`),u.length>0&&(u+=`
`)):(m=[bl(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(jn).join(`
`),u=[bl(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+h:"",t.envMap?"#define "+d:"",f?"#define CUBEUV_TEXEL_WIDTH "+f.texelWidth:"",f?"#define CUBEUV_TEXEL_HEIGHT "+f.texelHeight:"",f?"#define CUBEUV_MAX_MIP "+f.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Di?"#define TONE_MAPPING":"",t.toneMapping!==Di?Be.tonemapping_pars_fragment:"",t.toneMapping!==Di?xm("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Be.colorspace_pars_fragment,ym("linearToOutputTexel",t.outputColorSpace),_m(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(jn).join(`
`)),a=Fa(a),a=yl(a,t),a=xl(a,t),o=Fa(o),o=yl(o,t),o=xl(o,t),a=_l(a),o=_l(o),t.isRawShaderMaterial!==!0&&(v=`#version 300 es
`,m=[p,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,u=["#define varying in",t.glslVersion===fo?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===fo?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+u);const _=v+m+a,x=v+u+o,T=ml(n,n.VERTEX_SHADER,_),C=ml(n,n.FRAGMENT_SHADER,x);n.attachShader(y,T),n.attachShader(y,C),t.index0AttributeName!==void 0?n.bindAttribLocation(y,0,t.index0AttributeName):t.morphTargets===!0&&n.bindAttribLocation(y,0,"position"),n.linkProgram(y);function A(I){if(s.debug.checkShaderErrors){const F=n.getProgramInfoLog(y).trim(),N=n.getShaderInfoLog(T).trim(),W=n.getShaderInfoLog(C).trim();let $=!0,X=!0;if(n.getProgramParameter(y,n.LINK_STATUS)===!1)if($=!1,typeof s.debug.onShaderError=="function")s.debug.onShaderError(n,y,T,C);else{const j=vl(n,T,"vertex"),G=vl(n,C,"fragment");console.error("THREE.WebGLProgram: Shader Error "+n.getError()+" - VALIDATE_STATUS "+n.getProgramParameter(y,n.VALIDATE_STATUS)+`

Material Name: `+I.name+`
Material Type: `+I.type+`

Program Info Log: `+F+`
`+j+`
`+G)}else F!==""?console.warn("THREE.WebGLProgram: Program Info Log:",F):(N===""||W==="")&&(X=!1);X&&(I.diagnostics={runnable:$,programLog:F,vertexShader:{log:N,prefix:m},fragmentShader:{log:W,prefix:u}})}n.deleteShader(T),n.deleteShader(C),P=new Ys(n,y),M=Mm(n,y)}let P;this.getUniforms=function(){return P===void 0&&A(this),P};let M;this.getAttributes=function(){return M===void 0&&A(this),M};let S=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return S===!1&&(S=n.getProgramParameter(y,pm)),S},this.destroy=function(){i.releaseStatesOfProgram(this),n.deleteProgram(y),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=mm++,this.cacheKey=e,this.usedTimes=1,this.program=y,this.vertexShader=T,this.fragmentShader=C,this}let Um=0;class Bm{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,i=e.fragmentShader,n=this._getShaderStage(t),r=this._getShaderStage(i),a=this._getShaderCacheForMaterial(e);return a.has(n)===!1&&(a.add(n),n.usedTimes++),a.has(r)===!1&&(a.add(r),r.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){const t=this.shaderCache;let i=t.get(e);return i===void 0&&(i=new Nm(e),t.set(e,i)),i}}class Nm{constructor(e){this.id=Um++,this.code=e,this.usedTimes=0}}function Om(s,e,t,i,n,r,a){const o=new $a,l=new Bm,c=new Set,h=[],d=n.logarithmicDepthBuffer,f=n.vertexTextures;let p=n.precision;const g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function y(M){return c.add(M),M===0?"uv":`uv${M}`}function m(M,S,I,F,N){const W=F.fog,$=N.geometry,X=M.isMeshStandardMaterial?F.environment:null,j=(M.isMeshStandardMaterial?t:e).get(M.envMap||X),G=j&&j.mapping===sr?j.image.height:null,ae=g[M.type];M.precision!==null&&(p=n.getMaxPrecision(M.precision),p!==M.precision&&console.warn("THREE.WebGLProgram.getParameters:",M.precision,"not supported, using",p,"instead."));const de=$.morphAttributes.position||$.morphAttributes.normal||$.morphAttributes.color,_e=de!==void 0?de.length:0;let Ne=0;$.morphAttributes.position!==void 0&&(Ne=1),$.morphAttributes.normal!==void 0&&(Ne=2),$.morphAttributes.color!==void 0&&(Ne=3);let nt,Y,ie,ve;if(ae){const Je=ri[ae];nt=Je.vertexShader,Y=Je.fragmentShader}else nt=M.vertexShader,Y=M.fragmentShader,l.update(M),ie=l.getVertexShaderID(M),ve=l.getFragmentShaderID(M);const oe=s.getRenderTarget(),we=s.state.buffers.depth.getReversed(),Pe=N.isInstancedMesh===!0,Oe=N.isBatchedMesh===!0,ct=!!M.map,We=!!M.matcap,pt=!!j,D=!!M.aoMap,Gt=!!M.lightMap,He=!!M.bumpMap,Ve=!!M.normalMap,be=!!M.displacementMap,rt=!!M.emissiveMap,xe=!!M.metalnessMap,R=!!M.roughnessMap,b=M.anisotropy>0,z=M.clearcoat>0,Z=M.dispersion>0,Q=M.iridescence>0,q=M.sheen>0,ye=M.transmission>0,le=b&&!!M.anisotropyMap,fe=z&&!!M.clearcoatMap,Xe=z&&!!M.clearcoatNormalMap,te=z&&!!M.clearcoatRoughnessMap,pe=Q&&!!M.iridescenceMap,Ee=Q&&!!M.iridescenceThicknessMap,Re=q&&!!M.sheenColorMap,me=q&&!!M.sheenRoughnessMap,Ge=!!M.specularMap,Ue=!!M.specularColorMap,st=!!M.specularIntensityMap,L=ye&&!!M.transmissionMap,se=ye&&!!M.thicknessMap,V=!!M.gradientMap,K=!!M.alphaMap,he=M.alphaTest>0,ce=!!M.alphaHash,De=!!M.extensions;let ht=Di;M.toneMapped&&(oe===null||oe.isXRRenderTarget===!0)&&(ht=s.toneMapping);const Et={shaderID:ae,shaderType:M.type,shaderName:M.name,vertexShader:nt,fragmentShader:Y,defines:M.defines,customVertexShaderID:ie,customFragmentShaderID:ve,isRawShaderMaterial:M.isRawShaderMaterial===!0,glslVersion:M.glslVersion,precision:p,batching:Oe,batchingColor:Oe&&N._colorsTexture!==null,instancing:Pe,instancingColor:Pe&&N.instanceColor!==null,instancingMorph:Pe&&N.morphTexture!==null,supportsVertexTextures:f,outputColorSpace:oe===null?s.outputColorSpace:oe.isXRRenderTarget===!0?oe.texture.colorSpace:Dn,alphaToCoverage:!!M.alphaToCoverage,map:ct,matcap:We,envMap:pt,envMapMode:pt&&j.mapping,envMapCubeUVHeight:G,aoMap:D,lightMap:Gt,bumpMap:He,normalMap:Ve,displacementMap:f&&be,emissiveMap:rt,normalMapObjectSpace:Ve&&M.normalMapType===ch,normalMapTangentSpace:Ve&&M.normalMapType===Xa,metalnessMap:xe,roughnessMap:R,anisotropy:b,anisotropyMap:le,clearcoat:z,clearcoatMap:fe,clearcoatNormalMap:Xe,clearcoatRoughnessMap:te,dispersion:Z,iridescence:Q,iridescenceMap:pe,iridescenceThicknessMap:Ee,sheen:q,sheenColorMap:Re,sheenRoughnessMap:me,specularMap:Ge,specularColorMap:Ue,specularIntensityMap:st,transmission:ye,transmissionMap:L,thicknessMap:se,gradientMap:V,opaque:M.transparent===!1&&M.blending===vi&&M.alphaToCoverage===!1,alphaMap:K,alphaTest:he,alphaHash:ce,combine:M.combine,mapUv:ct&&y(M.map.channel),aoMapUv:D&&y(M.aoMap.channel),lightMapUv:Gt&&y(M.lightMap.channel),bumpMapUv:He&&y(M.bumpMap.channel),normalMapUv:Ve&&y(M.normalMap.channel),displacementMapUv:be&&y(M.displacementMap.channel),emissiveMapUv:rt&&y(M.emissiveMap.channel),metalnessMapUv:xe&&y(M.metalnessMap.channel),roughnessMapUv:R&&y(M.roughnessMap.channel),anisotropyMapUv:le&&y(M.anisotropyMap.channel),clearcoatMapUv:fe&&y(M.clearcoatMap.channel),clearcoatNormalMapUv:Xe&&y(M.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:te&&y(M.clearcoatRoughnessMap.channel),iridescenceMapUv:pe&&y(M.iridescenceMap.channel),iridescenceThicknessMapUv:Ee&&y(M.iridescenceThicknessMap.channel),sheenColorMapUv:Re&&y(M.sheenColorMap.channel),sheenRoughnessMapUv:me&&y(M.sheenRoughnessMap.channel),specularMapUv:Ge&&y(M.specularMap.channel),specularColorMapUv:Ue&&y(M.specularColorMap.channel),specularIntensityMapUv:st&&y(M.specularIntensityMap.channel),transmissionMapUv:L&&y(M.transmissionMap.channel),thicknessMapUv:se&&y(M.thicknessMap.channel),alphaMapUv:K&&y(M.alphaMap.channel),vertexTangents:!!$.attributes.tangent&&(Ve||b),vertexColors:M.vertexColors,vertexAlphas:M.vertexColors===!0&&!!$.attributes.color&&$.attributes.color.itemSize===4,pointsUvs:N.isPoints===!0&&!!$.attributes.uv&&(ct||K),fog:!!W,useFog:M.fog===!0,fogExp2:!!W&&W.isFogExp2,flatShading:M.flatShading===!0,sizeAttenuation:M.sizeAttenuation===!0,logarithmicDepthBuffer:d,reverseDepthBuffer:we,skinning:N.isSkinnedMesh===!0,morphTargets:$.morphAttributes.position!==void 0,morphNormals:$.morphAttributes.normal!==void 0,morphColors:$.morphAttributes.color!==void 0,morphTargetsCount:_e,morphTextureStride:Ne,numDirLights:S.directional.length,numPointLights:S.point.length,numSpotLights:S.spot.length,numSpotLightMaps:S.spotLightMap.length,numRectAreaLights:S.rectArea.length,numHemiLights:S.hemi.length,numDirLightShadows:S.directionalShadowMap.length,numPointLightShadows:S.pointShadowMap.length,numSpotLightShadows:S.spotShadowMap.length,numSpotLightShadowsWithMaps:S.numSpotLightShadowsWithMaps,numLightProbes:S.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:M.dithering,shadowMapEnabled:s.shadowMap.enabled&&I.length>0,shadowMapType:s.shadowMap.type,toneMapping:ht,decodeVideoTexture:ct&&M.map.isVideoTexture===!0&&Ye.getTransfer(M.map.colorSpace)===tt,decodeVideoTextureEmissive:rt&&M.emissiveMap.isVideoTexture===!0&&Ye.getTransfer(M.emissiveMap.colorSpace)===tt,premultipliedAlpha:M.premultipliedAlpha,doubleSided:M.side===Ct,flipSided:M.side===Ut,useDepthPacking:M.depthPacking>=0,depthPacking:M.depthPacking||0,index0AttributeName:M.index0AttributeName,extensionClipCullDistance:De&&M.extensions.clipCullDistance===!0&&i.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(De&&M.extensions.multiDraw===!0||Oe)&&i.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:M.customProgramCacheKey()};return Et.vertexUv1s=c.has(1),Et.vertexUv2s=c.has(2),Et.vertexUv3s=c.has(3),c.clear(),Et}function u(M){const S=[];if(M.shaderID?S.push(M.shaderID):(S.push(M.customVertexShaderID),S.push(M.customFragmentShaderID)),M.defines!==void 0)for(const I in M.defines)S.push(I),S.push(M.defines[I]);return M.isRawShaderMaterial===!1&&(v(S,M),_(S,M),S.push(s.outputColorSpace)),S.push(M.customProgramCacheKey),S.join()}function v(M,S){M.push(S.precision),M.push(S.outputColorSpace),M.push(S.envMapMode),M.push(S.envMapCubeUVHeight),M.push(S.mapUv),M.push(S.alphaMapUv),M.push(S.lightMapUv),M.push(S.aoMapUv),M.push(S.bumpMapUv),M.push(S.normalMapUv),M.push(S.displacementMapUv),M.push(S.emissiveMapUv),M.push(S.metalnessMapUv),M.push(S.roughnessMapUv),M.push(S.anisotropyMapUv),M.push(S.clearcoatMapUv),M.push(S.clearcoatNormalMapUv),M.push(S.clearcoatRoughnessMapUv),M.push(S.iridescenceMapUv),M.push(S.iridescenceThicknessMapUv),M.push(S.sheenColorMapUv),M.push(S.sheenRoughnessMapUv),M.push(S.specularMapUv),M.push(S.specularColorMapUv),M.push(S.specularIntensityMapUv),M.push(S.transmissionMapUv),M.push(S.thicknessMapUv),M.push(S.combine),M.push(S.fogExp2),M.push(S.sizeAttenuation),M.push(S.morphTargetsCount),M.push(S.morphAttributeCount),M.push(S.numDirLights),M.push(S.numPointLights),M.push(S.numSpotLights),M.push(S.numSpotLightMaps),M.push(S.numHemiLights),M.push(S.numRectAreaLights),M.push(S.numDirLightShadows),M.push(S.numPointLightShadows),M.push(S.numSpotLightShadows),M.push(S.numSpotLightShadowsWithMaps),M.push(S.numLightProbes),M.push(S.shadowMapType),M.push(S.toneMapping),M.push(S.numClippingPlanes),M.push(S.numClipIntersection),M.push(S.depthPacking)}function _(M,S){o.disableAll(),S.supportsVertexTextures&&o.enable(0),S.instancing&&o.enable(1),S.instancingColor&&o.enable(2),S.instancingMorph&&o.enable(3),S.matcap&&o.enable(4),S.envMap&&o.enable(5),S.normalMapObjectSpace&&o.enable(6),S.normalMapTangentSpace&&o.enable(7),S.clearcoat&&o.enable(8),S.iridescence&&o.enable(9),S.alphaTest&&o.enable(10),S.vertexColors&&o.enable(11),S.vertexAlphas&&o.enable(12),S.vertexUv1s&&o.enable(13),S.vertexUv2s&&o.enable(14),S.vertexUv3s&&o.enable(15),S.vertexTangents&&o.enable(16),S.anisotropy&&o.enable(17),S.alphaHash&&o.enable(18),S.batching&&o.enable(19),S.dispersion&&o.enable(20),S.batchingColor&&o.enable(21),M.push(o.mask),o.disableAll(),S.fog&&o.enable(0),S.useFog&&o.enable(1),S.flatShading&&o.enable(2),S.logarithmicDepthBuffer&&o.enable(3),S.reverseDepthBuffer&&o.enable(4),S.skinning&&o.enable(5),S.morphTargets&&o.enable(6),S.morphNormals&&o.enable(7),S.morphColors&&o.enable(8),S.premultipliedAlpha&&o.enable(9),S.shadowMapEnabled&&o.enable(10),S.doubleSided&&o.enable(11),S.flipSided&&o.enable(12),S.useDepthPacking&&o.enable(13),S.dithering&&o.enable(14),S.transmission&&o.enable(15),S.sheen&&o.enable(16),S.opaque&&o.enable(17),S.pointsUvs&&o.enable(18),S.decodeVideoTexture&&o.enable(19),S.decodeVideoTextureEmissive&&o.enable(20),S.alphaToCoverage&&o.enable(21),M.push(o.mask)}function x(M){const S=g[M.type];let I;if(S){const F=ri[S];I=eu.clone(F.uniforms)}else I=M.uniforms;return I}function T(M,S){let I;for(let F=0,N=h.length;F<N;F++){const W=h[F];if(W.cacheKey===S){I=W,++I.usedTimes;break}}return I===void 0&&(I=new Fm(s,S,M,r),h.push(I)),I}function C(M){if(--M.usedTimes===0){const S=h.indexOf(M);h[S]=h[h.length-1],h.pop(),M.destroy()}}function A(M){l.remove(M)}function P(){l.dispose()}return{getParameters:m,getProgramCacheKey:u,getUniforms:x,acquireProgram:T,releaseProgram:C,releaseShaderCache:A,programs:h,dispose:P}}function zm(){let s=new WeakMap;function e(a){return s.has(a)}function t(a){let o=s.get(a);return o===void 0&&(o={},s.set(a,o)),o}function i(a){s.delete(a)}function n(a,o,l){s.get(a)[o]=l}function r(){s=new WeakMap}return{has:e,get:t,remove:i,update:n,dispose:r}}function km(s,e){return s.groupOrder!==e.groupOrder?s.groupOrder-e.groupOrder:s.renderOrder!==e.renderOrder?s.renderOrder-e.renderOrder:s.material.id!==e.material.id?s.material.id-e.material.id:s.z!==e.z?s.z-e.z:s.id-e.id}function Sl(s,e){return s.groupOrder!==e.groupOrder?s.groupOrder-e.groupOrder:s.renderOrder!==e.renderOrder?s.renderOrder-e.renderOrder:s.z!==e.z?e.z-s.z:s.id-e.id}function Ml(){const s=[];let e=0;const t=[],i=[],n=[];function r(){e=0,t.length=0,i.length=0,n.length=0}function a(d,f,p,g,y,m){let u=s[e];return u===void 0?(u={id:d.id,object:d,geometry:f,material:p,groupOrder:g,renderOrder:d.renderOrder,z:y,group:m},s[e]=u):(u.id=d.id,u.object=d,u.geometry=f,u.material=p,u.groupOrder=g,u.renderOrder=d.renderOrder,u.z=y,u.group=m),e++,u}function o(d,f,p,g,y,m){const u=a(d,f,p,g,y,m);p.transmission>0?i.push(u):p.transparent===!0?n.push(u):t.push(u)}function l(d,f,p,g,y,m){const u=a(d,f,p,g,y,m);p.transmission>0?i.unshift(u):p.transparent===!0?n.unshift(u):t.unshift(u)}function c(d,f){t.length>1&&t.sort(d||km),i.length>1&&i.sort(f||Sl),n.length>1&&n.sort(f||Sl)}function h(){for(let d=e,f=s.length;d<f;d++){const p=s[d];if(p.id===null)break;p.id=null,p.object=null,p.geometry=null,p.material=null,p.group=null}}return{opaque:t,transmissive:i,transparent:n,init:r,push:o,unshift:l,finish:h,sort:c}}function Hm(){let s=new WeakMap;function e(i,n){const r=s.get(i);let a;return r===void 0?(a=new Ml,s.set(i,[a])):n>=r.length?(a=new Ml,r.push(a)):a=r[n],a}function t(){s=new WeakMap}return{get:e,dispose:t}}function Vm(){const s={};return{get:function(e){if(s[e.id]!==void 0)return s[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new w,color:new Ae};break;case"SpotLight":t={position:new w,direction:new w,color:new Ae,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new w,color:new Ae,distance:0,decay:0};break;case"HemisphereLight":t={direction:new w,skyColor:new Ae,groundColor:new Ae};break;case"RectAreaLight":t={color:new Ae,position:new w,halfWidth:new w,halfHeight:new w};break}return s[e.id]=t,t}}}function Gm(){const s={};return{get:function(e){if(s[e.id]!==void 0)return s[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Te};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Te};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Te,shadowCameraNear:1,shadowCameraFar:1e3};break}return s[e.id]=t,t}}}let Wm=0;function Xm(s,e){return(e.castShadow?2:0)-(s.castShadow?2:0)+(e.map?1:0)-(s.map?1:0)}function qm(s){const e=new Vm,t=Gm(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)i.probe.push(new w);const n=new w,r=new Ke,a=new Ke;function o(c){let h=0,d=0,f=0;for(let M=0;M<9;M++)i.probe[M].set(0,0,0);let p=0,g=0,y=0,m=0,u=0,v=0,_=0,x=0,T=0,C=0,A=0;c.sort(Xm);for(let M=0,S=c.length;M<S;M++){const I=c[M],F=I.color,N=I.intensity,W=I.distance,$=I.shadow&&I.shadow.map?I.shadow.map.texture:null;if(I.isAmbientLight)h+=F.r*N,d+=F.g*N,f+=F.b*N;else if(I.isLightProbe){for(let X=0;X<9;X++)i.probe[X].addScaledVector(I.sh.coefficients[X],N);A++}else if(I.isDirectionalLight){const X=e.get(I);if(X.color.copy(I.color).multiplyScalar(I.intensity),I.castShadow){const j=I.shadow,G=t.get(I);G.shadowIntensity=j.intensity,G.shadowBias=j.bias,G.shadowNormalBias=j.normalBias,G.shadowRadius=j.radius,G.shadowMapSize=j.mapSize,i.directionalShadow[p]=G,i.directionalShadowMap[p]=$,i.directionalShadowMatrix[p]=I.shadow.matrix,v++}i.directional[p]=X,p++}else if(I.isSpotLight){const X=e.get(I);X.position.setFromMatrixPosition(I.matrixWorld),X.color.copy(F).multiplyScalar(N),X.distance=W,X.coneCos=Math.cos(I.angle),X.penumbraCos=Math.cos(I.angle*(1-I.penumbra)),X.decay=I.decay,i.spot[y]=X;const j=I.shadow;if(I.map&&(i.spotLightMap[T]=I.map,T++,j.updateMatrices(I),I.castShadow&&C++),i.spotLightMatrix[y]=j.matrix,I.castShadow){const G=t.get(I);G.shadowIntensity=j.intensity,G.shadowBias=j.bias,G.shadowNormalBias=j.normalBias,G.shadowRadius=j.radius,G.shadowMapSize=j.mapSize,i.spotShadow[y]=G,i.spotShadowMap[y]=$,x++}y++}else if(I.isRectAreaLight){const X=e.get(I);X.color.copy(F).multiplyScalar(N),X.halfWidth.set(I.width*.5,0,0),X.halfHeight.set(0,I.height*.5,0),i.rectArea[m]=X,m++}else if(I.isPointLight){const X=e.get(I);if(X.color.copy(I.color).multiplyScalar(I.intensity),X.distance=I.distance,X.decay=I.decay,I.castShadow){const j=I.shadow,G=t.get(I);G.shadowIntensity=j.intensity,G.shadowBias=j.bias,G.shadowNormalBias=j.normalBias,G.shadowRadius=j.radius,G.shadowMapSize=j.mapSize,G.shadowCameraNear=j.camera.near,G.shadowCameraFar=j.camera.far,i.pointShadow[g]=G,i.pointShadowMap[g]=$,i.pointShadowMatrix[g]=I.shadow.matrix,_++}i.point[g]=X,g++}else if(I.isHemisphereLight){const X=e.get(I);X.skyColor.copy(I.color).multiplyScalar(N),X.groundColor.copy(I.groundColor).multiplyScalar(N),i.hemi[u]=X,u++}}m>0&&(s.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=ne.LTC_FLOAT_1,i.rectAreaLTC2=ne.LTC_FLOAT_2):(i.rectAreaLTC1=ne.LTC_HALF_1,i.rectAreaLTC2=ne.LTC_HALF_2)),i.ambient[0]=h,i.ambient[1]=d,i.ambient[2]=f;const P=i.hash;(P.directionalLength!==p||P.pointLength!==g||P.spotLength!==y||P.rectAreaLength!==m||P.hemiLength!==u||P.numDirectionalShadows!==v||P.numPointShadows!==_||P.numSpotShadows!==x||P.numSpotMaps!==T||P.numLightProbes!==A)&&(i.directional.length=p,i.spot.length=y,i.rectArea.length=m,i.point.length=g,i.hemi.length=u,i.directionalShadow.length=v,i.directionalShadowMap.length=v,i.pointShadow.length=_,i.pointShadowMap.length=_,i.spotShadow.length=x,i.spotShadowMap.length=x,i.directionalShadowMatrix.length=v,i.pointShadowMatrix.length=_,i.spotLightMatrix.length=x+T-C,i.spotLightMap.length=T,i.numSpotLightShadowsWithMaps=C,i.numLightProbes=A,P.directionalLength=p,P.pointLength=g,P.spotLength=y,P.rectAreaLength=m,P.hemiLength=u,P.numDirectionalShadows=v,P.numPointShadows=_,P.numSpotShadows=x,P.numSpotMaps=T,P.numLightProbes=A,i.version=Wm++)}function l(c,h){let d=0,f=0,p=0,g=0,y=0;const m=h.matrixWorldInverse;for(let u=0,v=c.length;u<v;u++){const _=c[u];if(_.isDirectionalLight){const x=i.directional[d];x.direction.setFromMatrixPosition(_.matrixWorld),n.setFromMatrixPosition(_.target.matrixWorld),x.direction.sub(n),x.direction.transformDirection(m),d++}else if(_.isSpotLight){const x=i.spot[p];x.position.setFromMatrixPosition(_.matrixWorld),x.position.applyMatrix4(m),x.direction.setFromMatrixPosition(_.matrixWorld),n.setFromMatrixPosition(_.target.matrixWorld),x.direction.sub(n),x.direction.transformDirection(m),p++}else if(_.isRectAreaLight){const x=i.rectArea[g];x.position.setFromMatrixPosition(_.matrixWorld),x.position.applyMatrix4(m),a.identity(),r.copy(_.matrixWorld),r.premultiply(m),a.extractRotation(r),x.halfWidth.set(_.width*.5,0,0),x.halfHeight.set(0,_.height*.5,0),x.halfWidth.applyMatrix4(a),x.halfHeight.applyMatrix4(a),g++}else if(_.isPointLight){const x=i.point[f];x.position.setFromMatrixPosition(_.matrixWorld),x.position.applyMatrix4(m),f++}else if(_.isHemisphereLight){const x=i.hemi[y];x.direction.setFromMatrixPosition(_.matrixWorld),x.direction.transformDirection(m),y++}}}return{setup:o,setupView:l,state:i}}function El(s){const e=new qm(s),t=[],i=[];function n(h){c.camera=h,t.length=0,i.length=0}function r(h){t.push(h)}function a(h){i.push(h)}function o(){e.setup(t)}function l(h){e.setupView(t,h)}const c={lightsArray:t,shadowsArray:i,camera:null,lights:e,transmissionRenderTarget:{}};return{init:n,state:c,setupLights:o,setupLightsView:l,pushLight:r,pushShadow:a}}function $m(s){let e=new WeakMap;function t(n,r=0){const a=e.get(n);let o;return a===void 0?(o=new El(s),e.set(n,[o])):r>=a.length?(o=new El(s),a.push(o)):o=a[r],o}function i(){e=new WeakMap}return{get:t,dispose:i}}const Ym=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Zm=`uniform sampler2D shadow_pass;
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
}`;function Km(s,e,t){let i=new Ya;const n=new Te,r=new Te,a=new it,o=new fu({depthPacking:lh}),l=new pu,c={},h=t.maxTextureSize,d={[Li]:Ut,[Ut]:Li,[Ct]:Ct},f=new dt({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Te},radius:{value:4}},vertexShader:Ym,fragmentShader:Zm}),p=f.clone();p.defines.HORIZONTAL_PASS=1;const g=new vt;g.setAttribute("position",new lt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const y=new at(g,f),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Vl;let u=this.type;this.render=function(C,A,P){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||C.length===0)return;const M=s.getRenderTarget(),S=s.getActiveCubeFace(),I=s.getActiveMipmapLevel(),F=s.state;F.setBlending(Ii),F.buffers.color.setClear(1,1,1,1),F.buffers.depth.setTest(!0),F.setScissorTest(!1);const N=u!==pi&&this.type===pi,W=u===pi&&this.type!==pi;for(let $=0,X=C.length;$<X;$++){const j=C[$],G=j.shadow;if(G===void 0){console.warn("THREE.WebGLShadowMap:",j,"has no shadow.");continue}if(G.autoUpdate===!1&&G.needsUpdate===!1)continue;n.copy(G.mapSize);const ae=G.getFrameExtents();if(n.multiply(ae),r.copy(G.mapSize),(n.x>h||n.y>h)&&(n.x>h&&(r.x=Math.floor(h/ae.x),n.x=r.x*ae.x,G.mapSize.x=r.x),n.y>h&&(r.y=Math.floor(h/ae.y),n.y=r.y*ae.y,G.mapSize.y=r.y)),G.map===null||N===!0||W===!0){const _e=this.type!==pi?{minFilter:Vt,magFilter:Vt}:{};G.map!==null&&G.map.dispose(),G.map=new Ki(n.x,n.y,_e),G.map.texture.name=j.name+".shadowMap",G.camera.updateProjectionMatrix()}s.setRenderTarget(G.map),s.clear();const de=G.getViewportCount();for(let _e=0;_e<de;_e++){const Ne=G.getViewport(_e);a.set(r.x*Ne.x,r.y*Ne.y,r.x*Ne.z,r.y*Ne.w),F.viewport(a),G.updateMatrices(j,_e),i=G.getFrustum(),x(A,P,G.camera,j,this.type)}G.isPointLightShadow!==!0&&this.type===pi&&v(G,P),G.needsUpdate=!1}u=this.type,m.needsUpdate=!1,s.setRenderTarget(M,S,I)};function v(C,A){const P=e.update(y);f.defines.VSM_SAMPLES!==C.blurSamples&&(f.defines.VSM_SAMPLES=C.blurSamples,p.defines.VSM_SAMPLES=C.blurSamples,f.needsUpdate=!0,p.needsUpdate=!0),C.mapPass===null&&(C.mapPass=new Ki(n.x,n.y)),f.uniforms.shadow_pass.value=C.map.texture,f.uniforms.resolution.value=C.mapSize,f.uniforms.radius.value=C.radius,s.setRenderTarget(C.mapPass),s.clear(),s.renderBufferDirect(A,null,P,f,y,null),p.uniforms.shadow_pass.value=C.mapPass.texture,p.uniforms.resolution.value=C.mapSize,p.uniforms.radius.value=C.radius,s.setRenderTarget(C.map),s.clear(),s.renderBufferDirect(A,null,P,p,y,null)}function _(C,A,P,M){let S=null;const I=P.isPointLight===!0?C.customDistanceMaterial:C.customDepthMaterial;if(I!==void 0)S=I;else if(S=P.isPointLight===!0?l:o,s.localClippingEnabled&&A.clipShadows===!0&&Array.isArray(A.clippingPlanes)&&A.clippingPlanes.length!==0||A.displacementMap&&A.displacementScale!==0||A.alphaMap&&A.alphaTest>0||A.map&&A.alphaTest>0){const F=S.uuid,N=A.uuid;let W=c[F];W===void 0&&(W={},c[F]=W);let $=W[N];$===void 0&&($=S.clone(),W[N]=$,A.addEventListener("dispose",T)),S=$}if(S.visible=A.visible,S.wireframe=A.wireframe,M===pi?S.side=A.shadowSide!==null?A.shadowSide:A.side:S.side=A.shadowSide!==null?A.shadowSide:d[A.side],S.alphaMap=A.alphaMap,S.alphaTest=A.alphaTest,S.map=A.map,S.clipShadows=A.clipShadows,S.clippingPlanes=A.clippingPlanes,S.clipIntersection=A.clipIntersection,S.displacementMap=A.displacementMap,S.displacementScale=A.displacementScale,S.displacementBias=A.displacementBias,S.wireframeLinewidth=A.wireframeLinewidth,S.linewidth=A.linewidth,P.isPointLight===!0&&S.isMeshDistanceMaterial===!0){const F=s.properties.get(S);F.light=P}return S}function x(C,A,P,M,S){if(C.visible===!1)return;if(C.layers.test(A.layers)&&(C.isMesh||C.isLine||C.isPoints)&&(C.castShadow||C.receiveShadow&&S===pi)&&(!C.frustumCulled||i.intersectsObject(C))){C.modelViewMatrix.multiplyMatrices(P.matrixWorldInverse,C.matrixWorld);const N=e.update(C),W=C.material;if(Array.isArray(W)){const $=N.groups;for(let X=0,j=$.length;X<j;X++){const G=$[X],ae=W[G.materialIndex];if(ae&&ae.visible){const de=_(C,ae,M,S);C.onBeforeShadow(s,C,A,P,N,de,G),s.renderBufferDirect(P,null,N,de,C,G),C.onAfterShadow(s,C,A,P,N,de,G)}}}else if(W.visible){const $=_(C,W,M,S);C.onBeforeShadow(s,C,A,P,N,$,null),s.renderBufferDirect(P,null,N,$,C,null),C.onAfterShadow(s,C,A,P,N,$,null)}}const F=C.children;for(let N=0,W=F.length;N<W;N++)x(F[N],A,P,M,S)}function T(C){C.target.removeEventListener("dispose",T);for(const P in c){const M=c[P],S=C.target.uuid;S in M&&(M[S].dispose(),delete M[S])}}}const jm={[Zr]:Kr,[jr]:ea,[Qr]:ta,[Rn]:Jr,[Kr]:Zr,[ea]:jr,[ta]:Qr,[Jr]:Rn};function Qm(s,e){function t(){let L=!1;const se=new it;let V=null;const K=new it(0,0,0,0);return{setMask:function(he){V!==he&&!L&&(s.colorMask(he,he,he,he),V=he)},setLocked:function(he){L=he},setClear:function(he,ce,De,ht,Et){Et===!0&&(he*=ht,ce*=ht,De*=ht),se.set(he,ce,De,ht),K.equals(se)===!1&&(s.clearColor(he,ce,De,ht),K.copy(se))},reset:function(){L=!1,V=null,K.set(-1,0,0,0)}}}function i(){let L=!1,se=!1,V=null,K=null,he=null;return{setReversed:function(ce){if(se!==ce){const De=e.get("EXT_clip_control");se?De.clipControlEXT(De.LOWER_LEFT_EXT,De.ZERO_TO_ONE_EXT):De.clipControlEXT(De.LOWER_LEFT_EXT,De.NEGATIVE_ONE_TO_ONE_EXT);const ht=he;he=null,this.setClear(ht)}se=ce},getReversed:function(){return se},setTest:function(ce){ce?oe(s.DEPTH_TEST):we(s.DEPTH_TEST)},setMask:function(ce){V!==ce&&!L&&(s.depthMask(ce),V=ce)},setFunc:function(ce){if(se&&(ce=jm[ce]),K!==ce){switch(ce){case Zr:s.depthFunc(s.NEVER);break;case Kr:s.depthFunc(s.ALWAYS);break;case jr:s.depthFunc(s.LESS);break;case Rn:s.depthFunc(s.LEQUAL);break;case Qr:s.depthFunc(s.EQUAL);break;case Jr:s.depthFunc(s.GEQUAL);break;case ea:s.depthFunc(s.GREATER);break;case ta:s.depthFunc(s.NOTEQUAL);break;default:s.depthFunc(s.LEQUAL)}K=ce}},setLocked:function(ce){L=ce},setClear:function(ce){he!==ce&&(se&&(ce=1-ce),s.clearDepth(ce),he=ce)},reset:function(){L=!1,V=null,K=null,he=null,se=!1}}}function n(){let L=!1,se=null,V=null,K=null,he=null,ce=null,De=null,ht=null,Et=null;return{setTest:function(Je){L||(Je?oe(s.STENCIL_TEST):we(s.STENCIL_TEST))},setMask:function(Je){se!==Je&&!L&&(s.stencilMask(Je),se=Je)},setFunc:function(Je,Kt,oi){(V!==Je||K!==Kt||he!==oi)&&(s.stencilFunc(Je,Kt,oi),V=Je,K=Kt,he=oi)},setOp:function(Je,Kt,oi){(ce!==Je||De!==Kt||ht!==oi)&&(s.stencilOp(Je,Kt,oi),ce=Je,De=Kt,ht=oi)},setLocked:function(Je){L=Je},setClear:function(Je){Et!==Je&&(s.clearStencil(Je),Et=Je)},reset:function(){L=!1,se=null,V=null,K=null,he=null,ce=null,De=null,ht=null,Et=null}}}const r=new t,a=new i,o=new n,l=new WeakMap,c=new WeakMap;let h={},d={},f=new WeakMap,p=[],g=null,y=!1,m=null,u=null,v=null,_=null,x=null,T=null,C=null,A=new Ae(0,0,0),P=0,M=!1,S=null,I=null,F=null,N=null,W=null;const $=s.getParameter(s.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let X=!1,j=0;const G=s.getParameter(s.VERSION);G.indexOf("WebGL")!==-1?(j=parseFloat(/^WebGL (\d)/.exec(G)[1]),X=j>=1):G.indexOf("OpenGL ES")!==-1&&(j=parseFloat(/^OpenGL ES (\d)/.exec(G)[1]),X=j>=2);let ae=null,de={};const _e=s.getParameter(s.SCISSOR_BOX),Ne=s.getParameter(s.VIEWPORT),nt=new it().fromArray(_e),Y=new it().fromArray(Ne);function ie(L,se,V,K){const he=new Uint8Array(4),ce=s.createTexture();s.bindTexture(L,ce),s.texParameteri(L,s.TEXTURE_MIN_FILTER,s.NEAREST),s.texParameteri(L,s.TEXTURE_MAG_FILTER,s.NEAREST);for(let De=0;De<V;De++)L===s.TEXTURE_3D||L===s.TEXTURE_2D_ARRAY?s.texImage3D(se,0,s.RGBA,1,1,K,0,s.RGBA,s.UNSIGNED_BYTE,he):s.texImage2D(se+De,0,s.RGBA,1,1,0,s.RGBA,s.UNSIGNED_BYTE,he);return ce}const ve={};ve[s.TEXTURE_2D]=ie(s.TEXTURE_2D,s.TEXTURE_2D,1),ve[s.TEXTURE_CUBE_MAP]=ie(s.TEXTURE_CUBE_MAP,s.TEXTURE_CUBE_MAP_POSITIVE_X,6),ve[s.TEXTURE_2D_ARRAY]=ie(s.TEXTURE_2D_ARRAY,s.TEXTURE_2D_ARRAY,1,1),ve[s.TEXTURE_3D]=ie(s.TEXTURE_3D,s.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),oe(s.DEPTH_TEST),a.setFunc(Rn),He(!1),Ve(lo),oe(s.CULL_FACE),D(Ii);function oe(L){h[L]!==!0&&(s.enable(L),h[L]=!0)}function we(L){h[L]!==!1&&(s.disable(L),h[L]=!1)}function Pe(L,se){return d[L]!==se?(s.bindFramebuffer(L,se),d[L]=se,L===s.DRAW_FRAMEBUFFER&&(d[s.FRAMEBUFFER]=se),L===s.FRAMEBUFFER&&(d[s.DRAW_FRAMEBUFFER]=se),!0):!1}function Oe(L,se){let V=p,K=!1;if(L){V=f.get(se),V===void 0&&(V=[],f.set(se,V));const he=L.textures;if(V.length!==he.length||V[0]!==s.COLOR_ATTACHMENT0){for(let ce=0,De=he.length;ce<De;ce++)V[ce]=s.COLOR_ATTACHMENT0+ce;V.length=he.length,K=!0}}else V[0]!==s.BACK&&(V[0]=s.BACK,K=!0);K&&s.drawBuffers(V)}function ct(L){return g!==L?(s.useProgram(L),g=L,!0):!1}const We={[Wi]:s.FUNC_ADD,[Uc]:s.FUNC_SUBTRACT,[Bc]:s.FUNC_REVERSE_SUBTRACT};We[Nc]=s.MIN,We[Oc]=s.MAX;const pt={[zc]:s.ZERO,[kc]:s.ONE,[Hc]:s.SRC_COLOR,[$r]:s.SRC_ALPHA,[$c]:s.SRC_ALPHA_SATURATE,[Xc]:s.DST_COLOR,[Gc]:s.DST_ALPHA,[Vc]:s.ONE_MINUS_SRC_COLOR,[Yr]:s.ONE_MINUS_SRC_ALPHA,[qc]:s.ONE_MINUS_DST_COLOR,[Wc]:s.ONE_MINUS_DST_ALPHA,[Yc]:s.CONSTANT_COLOR,[Zc]:s.ONE_MINUS_CONSTANT_COLOR,[Kc]:s.CONSTANT_ALPHA,[jc]:s.ONE_MINUS_CONSTANT_ALPHA};function D(L,se,V,K,he,ce,De,ht,Et,Je){if(L===Ii){y===!0&&(we(s.BLEND),y=!1);return}if(y===!1&&(oe(s.BLEND),y=!0),L!==Fc){if(L!==m||Je!==M){if((u!==Wi||x!==Wi)&&(s.blendEquation(s.FUNC_ADD),u=Wi,x=Wi),Je)switch(L){case vi:s.blendFuncSeparate(s.ONE,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case $i:s.blendFunc(s.ONE,s.ONE);break;case co:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case ho:s.blendFuncSeparate(s.ZERO,s.SRC_COLOR,s.ZERO,s.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",L);break}else switch(L){case vi:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case $i:s.blendFunc(s.SRC_ALPHA,s.ONE);break;case co:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case ho:s.blendFunc(s.ZERO,s.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",L);break}v=null,_=null,T=null,C=null,A.set(0,0,0),P=0,m=L,M=Je}return}he=he||se,ce=ce||V,De=De||K,(se!==u||he!==x)&&(s.blendEquationSeparate(We[se],We[he]),u=se,x=he),(V!==v||K!==_||ce!==T||De!==C)&&(s.blendFuncSeparate(pt[V],pt[K],pt[ce],pt[De]),v=V,_=K,T=ce,C=De),(ht.equals(A)===!1||Et!==P)&&(s.blendColor(ht.r,ht.g,ht.b,Et),A.copy(ht),P=Et),m=L,M=!1}function Gt(L,se){L.side===Ct?we(s.CULL_FACE):oe(s.CULL_FACE);let V=L.side===Ut;se&&(V=!V),He(V),L.blending===vi&&L.transparent===!1?D(Ii):D(L.blending,L.blendEquation,L.blendSrc,L.blendDst,L.blendEquationAlpha,L.blendSrcAlpha,L.blendDstAlpha,L.blendColor,L.blendAlpha,L.premultipliedAlpha),a.setFunc(L.depthFunc),a.setTest(L.depthTest),a.setMask(L.depthWrite),r.setMask(L.colorWrite);const K=L.stencilWrite;o.setTest(K),K&&(o.setMask(L.stencilWriteMask),o.setFunc(L.stencilFunc,L.stencilRef,L.stencilFuncMask),o.setOp(L.stencilFail,L.stencilZFail,L.stencilZPass)),rt(L.polygonOffset,L.polygonOffsetFactor,L.polygonOffsetUnits),L.alphaToCoverage===!0?oe(s.SAMPLE_ALPHA_TO_COVERAGE):we(s.SAMPLE_ALPHA_TO_COVERAGE)}function He(L){S!==L&&(L?s.frontFace(s.CW):s.frontFace(s.CCW),S=L)}function Ve(L){L!==Ic?(oe(s.CULL_FACE),L!==I&&(L===lo?s.cullFace(s.BACK):L===Dc?s.cullFace(s.FRONT):s.cullFace(s.FRONT_AND_BACK))):we(s.CULL_FACE),I=L}function be(L){L!==F&&(X&&s.lineWidth(L),F=L)}function rt(L,se,V){L?(oe(s.POLYGON_OFFSET_FILL),(N!==se||W!==V)&&(s.polygonOffset(se,V),N=se,W=V)):we(s.POLYGON_OFFSET_FILL)}function xe(L){L?oe(s.SCISSOR_TEST):we(s.SCISSOR_TEST)}function R(L){L===void 0&&(L=s.TEXTURE0+$-1),ae!==L&&(s.activeTexture(L),ae=L)}function b(L,se,V){V===void 0&&(ae===null?V=s.TEXTURE0+$-1:V=ae);let K=de[V];K===void 0&&(K={type:void 0,texture:void 0},de[V]=K),(K.type!==L||K.texture!==se)&&(ae!==V&&(s.activeTexture(V),ae=V),s.bindTexture(L,se||ve[L]),K.type=L,K.texture=se)}function z(){const L=de[ae];L!==void 0&&L.type!==void 0&&(s.bindTexture(L.type,null),L.type=void 0,L.texture=void 0)}function Z(){try{s.compressedTexImage2D.apply(s,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function Q(){try{s.compressedTexImage3D.apply(s,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function q(){try{s.texSubImage2D.apply(s,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function ye(){try{s.texSubImage3D.apply(s,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function le(){try{s.compressedTexSubImage2D.apply(s,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function fe(){try{s.compressedTexSubImage3D.apply(s,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function Xe(){try{s.texStorage2D.apply(s,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function te(){try{s.texStorage3D.apply(s,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function pe(){try{s.texImage2D.apply(s,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function Ee(){try{s.texImage3D.apply(s,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function Re(L){nt.equals(L)===!1&&(s.scissor(L.x,L.y,L.z,L.w),nt.copy(L))}function me(L){Y.equals(L)===!1&&(s.viewport(L.x,L.y,L.z,L.w),Y.copy(L))}function Ge(L,se){let V=c.get(se);V===void 0&&(V=new WeakMap,c.set(se,V));let K=V.get(L);K===void 0&&(K=s.getUniformBlockIndex(se,L.name),V.set(L,K))}function Ue(L,se){const K=c.get(se).get(L);l.get(se)!==K&&(s.uniformBlockBinding(se,K,L.__bindingPointIndex),l.set(se,K))}function st(){s.disable(s.BLEND),s.disable(s.CULL_FACE),s.disable(s.DEPTH_TEST),s.disable(s.POLYGON_OFFSET_FILL),s.disable(s.SCISSOR_TEST),s.disable(s.STENCIL_TEST),s.disable(s.SAMPLE_ALPHA_TO_COVERAGE),s.blendEquation(s.FUNC_ADD),s.blendFunc(s.ONE,s.ZERO),s.blendFuncSeparate(s.ONE,s.ZERO,s.ONE,s.ZERO),s.blendColor(0,0,0,0),s.colorMask(!0,!0,!0,!0),s.clearColor(0,0,0,0),s.depthMask(!0),s.depthFunc(s.LESS),a.setReversed(!1),s.clearDepth(1),s.stencilMask(4294967295),s.stencilFunc(s.ALWAYS,0,4294967295),s.stencilOp(s.KEEP,s.KEEP,s.KEEP),s.clearStencil(0),s.cullFace(s.BACK),s.frontFace(s.CCW),s.polygonOffset(0,0),s.activeTexture(s.TEXTURE0),s.bindFramebuffer(s.FRAMEBUFFER,null),s.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),s.bindFramebuffer(s.READ_FRAMEBUFFER,null),s.useProgram(null),s.lineWidth(1),s.scissor(0,0,s.canvas.width,s.canvas.height),s.viewport(0,0,s.canvas.width,s.canvas.height),h={},ae=null,de={},d={},f=new WeakMap,p=[],g=null,y=!1,m=null,u=null,v=null,_=null,x=null,T=null,C=null,A=new Ae(0,0,0),P=0,M=!1,S=null,I=null,F=null,N=null,W=null,nt.set(0,0,s.canvas.width,s.canvas.height),Y.set(0,0,s.canvas.width,s.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:oe,disable:we,bindFramebuffer:Pe,drawBuffers:Oe,useProgram:ct,setBlending:D,setMaterial:Gt,setFlipSided:He,setCullFace:Ve,setLineWidth:be,setPolygonOffset:rt,setScissorTest:xe,activeTexture:R,bindTexture:b,unbindTexture:z,compressedTexImage2D:Z,compressedTexImage3D:Q,texImage2D:pe,texImage3D:Ee,updateUBOMapping:Ge,uniformBlockBinding:Ue,texStorage2D:Xe,texStorage3D:te,texSubImage2D:q,texSubImage3D:ye,compressedTexSubImage2D:le,compressedTexSubImage3D:fe,scissor:Re,viewport:me,reset:st}}function Jm(s,e,t,i,n,r,a){const o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Te,h=new WeakMap;let d;const f=new WeakMap;let p=!1;try{p=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(R,b){return p?new OffscreenCanvas(R,b):ss("canvas")}function y(R,b,z){let Z=1;const Q=xe(R);if((Q.width>z||Q.height>z)&&(Z=z/Math.max(Q.width,Q.height)),Z<1)if(typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&R instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&R instanceof ImageBitmap||typeof VideoFrame<"u"&&R instanceof VideoFrame){const q=Math.floor(Z*Q.width),ye=Math.floor(Z*Q.height);d===void 0&&(d=g(q,ye));const le=b?g(q,ye):d;return le.width=q,le.height=ye,le.getContext("2d").drawImage(R,0,0,q,ye),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+Q.width+"x"+Q.height+") to ("+q+"x"+ye+")."),le}else return"data"in R&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+Q.width+"x"+Q.height+")."),R;return R}function m(R){return R.generateMipmaps}function u(R){s.generateMipmap(R)}function v(R){return R.isWebGLCubeRenderTarget?s.TEXTURE_CUBE_MAP:R.isWebGL3DRenderTarget?s.TEXTURE_3D:R.isWebGLArrayRenderTarget||R.isCompressedArrayTexture?s.TEXTURE_2D_ARRAY:s.TEXTURE_2D}function _(R,b,z,Z,Q=!1){if(R!==null){if(s[R]!==void 0)return s[R];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+R+"'")}let q=b;if(b===s.RED&&(z===s.FLOAT&&(q=s.R32F),z===s.HALF_FLOAT&&(q=s.R16F),z===s.UNSIGNED_BYTE&&(q=s.R8)),b===s.RED_INTEGER&&(z===s.UNSIGNED_BYTE&&(q=s.R8UI),z===s.UNSIGNED_SHORT&&(q=s.R16UI),z===s.UNSIGNED_INT&&(q=s.R32UI),z===s.BYTE&&(q=s.R8I),z===s.SHORT&&(q=s.R16I),z===s.INT&&(q=s.R32I)),b===s.RG&&(z===s.FLOAT&&(q=s.RG32F),z===s.HALF_FLOAT&&(q=s.RG16F),z===s.UNSIGNED_BYTE&&(q=s.RG8)),b===s.RG_INTEGER&&(z===s.UNSIGNED_BYTE&&(q=s.RG8UI),z===s.UNSIGNED_SHORT&&(q=s.RG16UI),z===s.UNSIGNED_INT&&(q=s.RG32UI),z===s.BYTE&&(q=s.RG8I),z===s.SHORT&&(q=s.RG16I),z===s.INT&&(q=s.RG32I)),b===s.RGB_INTEGER&&(z===s.UNSIGNED_BYTE&&(q=s.RGB8UI),z===s.UNSIGNED_SHORT&&(q=s.RGB16UI),z===s.UNSIGNED_INT&&(q=s.RGB32UI),z===s.BYTE&&(q=s.RGB8I),z===s.SHORT&&(q=s.RGB16I),z===s.INT&&(q=s.RGB32I)),b===s.RGBA_INTEGER&&(z===s.UNSIGNED_BYTE&&(q=s.RGBA8UI),z===s.UNSIGNED_SHORT&&(q=s.RGBA16UI),z===s.UNSIGNED_INT&&(q=s.RGBA32UI),z===s.BYTE&&(q=s.RGBA8I),z===s.SHORT&&(q=s.RGBA16I),z===s.INT&&(q=s.RGBA32I)),b===s.RGB&&z===s.UNSIGNED_INT_5_9_9_9_REV&&(q=s.RGB9_E5),b===s.RGBA){const ye=Q?Ks:Ye.getTransfer(Z);z===s.FLOAT&&(q=s.RGBA32F),z===s.HALF_FLOAT&&(q=s.RGBA16F),z===s.UNSIGNED_BYTE&&(q=ye===tt?s.SRGB8_ALPHA8:s.RGBA8),z===s.UNSIGNED_SHORT_4_4_4_4&&(q=s.RGBA4),z===s.UNSIGNED_SHORT_5_5_5_1&&(q=s.RGB5_A1)}return(q===s.R16F||q===s.R32F||q===s.RG16F||q===s.RG32F||q===s.RGBA16F||q===s.RGBA32F)&&e.get("EXT_color_buffer_float"),q}function x(R,b){let z;return R?b===null||b===Zi||b===Pn?z=s.DEPTH24_STENCIL8:b===ai?z=s.DEPTH32F_STENCIL8:b===is&&(z=s.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):b===null||b===Zi||b===Pn?z=s.DEPTH_COMPONENT24:b===ai?z=s.DEPTH_COMPONENT32F:b===is&&(z=s.DEPTH_COMPONENT16),z}function T(R,b){return m(R)===!0||R.isFramebufferTexture&&R.minFilter!==Vt&&R.minFilter!==Ht?Math.log2(Math.max(b.width,b.height))+1:R.mipmaps!==void 0&&R.mipmaps.length>0?R.mipmaps.length:R.isCompressedTexture&&Array.isArray(R.image)?b.mipmaps.length:1}function C(R){const b=R.target;b.removeEventListener("dispose",C),P(b),b.isVideoTexture&&h.delete(b)}function A(R){const b=R.target;b.removeEventListener("dispose",A),S(b)}function P(R){const b=i.get(R);if(b.__webglInit===void 0)return;const z=R.source,Z=f.get(z);if(Z){const Q=Z[b.__cacheKey];Q.usedTimes--,Q.usedTimes===0&&M(R),Object.keys(Z).length===0&&f.delete(z)}i.remove(R)}function M(R){const b=i.get(R);s.deleteTexture(b.__webglTexture);const z=R.source,Z=f.get(z);delete Z[b.__cacheKey],a.memory.textures--}function S(R){const b=i.get(R);if(R.depthTexture&&(R.depthTexture.dispose(),i.remove(R.depthTexture)),R.isWebGLCubeRenderTarget)for(let Z=0;Z<6;Z++){if(Array.isArray(b.__webglFramebuffer[Z]))for(let Q=0;Q<b.__webglFramebuffer[Z].length;Q++)s.deleteFramebuffer(b.__webglFramebuffer[Z][Q]);else s.deleteFramebuffer(b.__webglFramebuffer[Z]);b.__webglDepthbuffer&&s.deleteRenderbuffer(b.__webglDepthbuffer[Z])}else{if(Array.isArray(b.__webglFramebuffer))for(let Z=0;Z<b.__webglFramebuffer.length;Z++)s.deleteFramebuffer(b.__webglFramebuffer[Z]);else s.deleteFramebuffer(b.__webglFramebuffer);if(b.__webglDepthbuffer&&s.deleteRenderbuffer(b.__webglDepthbuffer),b.__webglMultisampledFramebuffer&&s.deleteFramebuffer(b.__webglMultisampledFramebuffer),b.__webglColorRenderbuffer)for(let Z=0;Z<b.__webglColorRenderbuffer.length;Z++)b.__webglColorRenderbuffer[Z]&&s.deleteRenderbuffer(b.__webglColorRenderbuffer[Z]);b.__webglDepthRenderbuffer&&s.deleteRenderbuffer(b.__webglDepthRenderbuffer)}const z=R.textures;for(let Z=0,Q=z.length;Z<Q;Z++){const q=i.get(z[Z]);q.__webglTexture&&(s.deleteTexture(q.__webglTexture),a.memory.textures--),i.remove(z[Z])}i.remove(R)}let I=0;function F(){I=0}function N(){const R=I;return R>=n.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+R+" texture units while this GPU supports only "+n.maxTextures),I+=1,R}function W(R){const b=[];return b.push(R.wrapS),b.push(R.wrapT),b.push(R.wrapR||0),b.push(R.magFilter),b.push(R.minFilter),b.push(R.anisotropy),b.push(R.internalFormat),b.push(R.format),b.push(R.type),b.push(R.generateMipmaps),b.push(R.premultiplyAlpha),b.push(R.flipY),b.push(R.unpackAlignment),b.push(R.colorSpace),b.join()}function $(R,b){const z=i.get(R);if(R.isVideoTexture&&be(R),R.isRenderTargetTexture===!1&&R.version>0&&z.__version!==R.version){const Z=R.image;if(Z===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(Z.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Y(z,R,b);return}}t.bindTexture(s.TEXTURE_2D,z.__webglTexture,s.TEXTURE0+b)}function X(R,b){const z=i.get(R);if(R.version>0&&z.__version!==R.version){Y(z,R,b);return}t.bindTexture(s.TEXTURE_2D_ARRAY,z.__webglTexture,s.TEXTURE0+b)}function j(R,b){const z=i.get(R);if(R.version>0&&z.__version!==R.version){Y(z,R,b);return}t.bindTexture(s.TEXTURE_3D,z.__webglTexture,s.TEXTURE0+b)}function G(R,b){const z=i.get(R);if(R.version>0&&z.__version!==R.version){ie(z,R,b);return}t.bindTexture(s.TEXTURE_CUBE_MAP,z.__webglTexture,s.TEXTURE0+b)}const ae={[ts]:s.REPEAT,[qi]:s.CLAMP_TO_EDGE,[sa]:s.MIRRORED_REPEAT},de={[Vt]:s.NEAREST,[ah]:s.NEAREST_MIPMAP_NEAREST,[hs]:s.NEAREST_MIPMAP_LINEAR,[Ht]:s.LINEAR,[hr]:s.LINEAR_MIPMAP_NEAREST,[Pi]:s.LINEAR_MIPMAP_LINEAR},_e={[hh]:s.NEVER,[gh]:s.ALWAYS,[uh]:s.LESS,[ec]:s.LEQUAL,[dh]:s.EQUAL,[mh]:s.GEQUAL,[fh]:s.GREATER,[ph]:s.NOTEQUAL};function Ne(R,b){if(b.type===ai&&e.has("OES_texture_float_linear")===!1&&(b.magFilter===Ht||b.magFilter===hr||b.magFilter===hs||b.magFilter===Pi||b.minFilter===Ht||b.minFilter===hr||b.minFilter===hs||b.minFilter===Pi)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),s.texParameteri(R,s.TEXTURE_WRAP_S,ae[b.wrapS]),s.texParameteri(R,s.TEXTURE_WRAP_T,ae[b.wrapT]),(R===s.TEXTURE_3D||R===s.TEXTURE_2D_ARRAY)&&s.texParameteri(R,s.TEXTURE_WRAP_R,ae[b.wrapR]),s.texParameteri(R,s.TEXTURE_MAG_FILTER,de[b.magFilter]),s.texParameteri(R,s.TEXTURE_MIN_FILTER,de[b.minFilter]),b.compareFunction&&(s.texParameteri(R,s.TEXTURE_COMPARE_MODE,s.COMPARE_REF_TO_TEXTURE),s.texParameteri(R,s.TEXTURE_COMPARE_FUNC,_e[b.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(b.magFilter===Vt||b.minFilter!==hs&&b.minFilter!==Pi||b.type===ai&&e.has("OES_texture_float_linear")===!1)return;if(b.anisotropy>1||i.get(b).__currentAnisotropy){const z=e.get("EXT_texture_filter_anisotropic");s.texParameterf(R,z.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(b.anisotropy,n.getMaxAnisotropy())),i.get(b).__currentAnisotropy=b.anisotropy}}}function nt(R,b){let z=!1;R.__webglInit===void 0&&(R.__webglInit=!0,b.addEventListener("dispose",C));const Z=b.source;let Q=f.get(Z);Q===void 0&&(Q={},f.set(Z,Q));const q=W(b);if(q!==R.__cacheKey){Q[q]===void 0&&(Q[q]={texture:s.createTexture(),usedTimes:0},a.memory.textures++,z=!0),Q[q].usedTimes++;const ye=Q[R.__cacheKey];ye!==void 0&&(Q[R.__cacheKey].usedTimes--,ye.usedTimes===0&&M(b)),R.__cacheKey=q,R.__webglTexture=Q[q].texture}return z}function Y(R,b,z){let Z=s.TEXTURE_2D;(b.isDataArrayTexture||b.isCompressedArrayTexture)&&(Z=s.TEXTURE_2D_ARRAY),b.isData3DTexture&&(Z=s.TEXTURE_3D);const Q=nt(R,b),q=b.source;t.bindTexture(Z,R.__webglTexture,s.TEXTURE0+z);const ye=i.get(q);if(q.version!==ye.__version||Q===!0){t.activeTexture(s.TEXTURE0+z);const le=Ye.getPrimaries(Ye.workingColorSpace),fe=b.colorSpace===Ai?null:Ye.getPrimaries(b.colorSpace),Xe=b.colorSpace===Ai||le===fe?s.NONE:s.BROWSER_DEFAULT_WEBGL;s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,b.flipY),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,b.premultiplyAlpha),s.pixelStorei(s.UNPACK_ALIGNMENT,b.unpackAlignment),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,Xe);let te=y(b.image,!1,n.maxTextureSize);te=rt(b,te);const pe=r.convert(b.format,b.colorSpace),Ee=r.convert(b.type);let Re=_(b.internalFormat,pe,Ee,b.colorSpace,b.isVideoTexture);Ne(Z,b);let me;const Ge=b.mipmaps,Ue=b.isVideoTexture!==!0,st=ye.__version===void 0||Q===!0,L=q.dataReady,se=T(b,te);if(b.isDepthTexture)Re=x(b.format===In,b.type),st&&(Ue?t.texStorage2D(s.TEXTURE_2D,1,Re,te.width,te.height):t.texImage2D(s.TEXTURE_2D,0,Re,te.width,te.height,0,pe,Ee,null));else if(b.isDataTexture)if(Ge.length>0){Ue&&st&&t.texStorage2D(s.TEXTURE_2D,se,Re,Ge[0].width,Ge[0].height);for(let V=0,K=Ge.length;V<K;V++)me=Ge[V],Ue?L&&t.texSubImage2D(s.TEXTURE_2D,V,0,0,me.width,me.height,pe,Ee,me.data):t.texImage2D(s.TEXTURE_2D,V,Re,me.width,me.height,0,pe,Ee,me.data);b.generateMipmaps=!1}else Ue?(st&&t.texStorage2D(s.TEXTURE_2D,se,Re,te.width,te.height),L&&t.texSubImage2D(s.TEXTURE_2D,0,0,0,te.width,te.height,pe,Ee,te.data)):t.texImage2D(s.TEXTURE_2D,0,Re,te.width,te.height,0,pe,Ee,te.data);else if(b.isCompressedTexture)if(b.isCompressedArrayTexture){Ue&&st&&t.texStorage3D(s.TEXTURE_2D_ARRAY,se,Re,Ge[0].width,Ge[0].height,te.depth);for(let V=0,K=Ge.length;V<K;V++)if(me=Ge[V],b.format!==Zt)if(pe!==null)if(Ue){if(L)if(b.layerUpdates.size>0){const he=el(me.width,me.height,b.format,b.type);for(const ce of b.layerUpdates){const De=me.data.subarray(ce*he/me.data.BYTES_PER_ELEMENT,(ce+1)*he/me.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,V,0,0,ce,me.width,me.height,1,pe,De)}b.clearLayerUpdates()}else t.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,V,0,0,0,me.width,me.height,te.depth,pe,me.data)}else t.compressedTexImage3D(s.TEXTURE_2D_ARRAY,V,Re,me.width,me.height,te.depth,0,me.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Ue?L&&t.texSubImage3D(s.TEXTURE_2D_ARRAY,V,0,0,0,me.width,me.height,te.depth,pe,Ee,me.data):t.texImage3D(s.TEXTURE_2D_ARRAY,V,Re,me.width,me.height,te.depth,0,pe,Ee,me.data)}else{Ue&&st&&t.texStorage2D(s.TEXTURE_2D,se,Re,Ge[0].width,Ge[0].height);for(let V=0,K=Ge.length;V<K;V++)me=Ge[V],b.format!==Zt?pe!==null?Ue?L&&t.compressedTexSubImage2D(s.TEXTURE_2D,V,0,0,me.width,me.height,pe,me.data):t.compressedTexImage2D(s.TEXTURE_2D,V,Re,me.width,me.height,0,me.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Ue?L&&t.texSubImage2D(s.TEXTURE_2D,V,0,0,me.width,me.height,pe,Ee,me.data):t.texImage2D(s.TEXTURE_2D,V,Re,me.width,me.height,0,pe,Ee,me.data)}else if(b.isDataArrayTexture)if(Ue){if(st&&t.texStorage3D(s.TEXTURE_2D_ARRAY,se,Re,te.width,te.height,te.depth),L)if(b.layerUpdates.size>0){const V=el(te.width,te.height,b.format,b.type);for(const K of b.layerUpdates){const he=te.data.subarray(K*V/te.data.BYTES_PER_ELEMENT,(K+1)*V/te.data.BYTES_PER_ELEMENT);t.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,K,te.width,te.height,1,pe,Ee,he)}b.clearLayerUpdates()}else t.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,0,te.width,te.height,te.depth,pe,Ee,te.data)}else t.texImage3D(s.TEXTURE_2D_ARRAY,0,Re,te.width,te.height,te.depth,0,pe,Ee,te.data);else if(b.isData3DTexture)Ue?(st&&t.texStorage3D(s.TEXTURE_3D,se,Re,te.width,te.height,te.depth),L&&t.texSubImage3D(s.TEXTURE_3D,0,0,0,0,te.width,te.height,te.depth,pe,Ee,te.data)):t.texImage3D(s.TEXTURE_3D,0,Re,te.width,te.height,te.depth,0,pe,Ee,te.data);else if(b.isFramebufferTexture){if(st)if(Ue)t.texStorage2D(s.TEXTURE_2D,se,Re,te.width,te.height);else{let V=te.width,K=te.height;for(let he=0;he<se;he++)t.texImage2D(s.TEXTURE_2D,he,Re,V,K,0,pe,Ee,null),V>>=1,K>>=1}}else if(Ge.length>0){if(Ue&&st){const V=xe(Ge[0]);t.texStorage2D(s.TEXTURE_2D,se,Re,V.width,V.height)}for(let V=0,K=Ge.length;V<K;V++)me=Ge[V],Ue?L&&t.texSubImage2D(s.TEXTURE_2D,V,0,0,pe,Ee,me):t.texImage2D(s.TEXTURE_2D,V,Re,pe,Ee,me);b.generateMipmaps=!1}else if(Ue){if(st){const V=xe(te);t.texStorage2D(s.TEXTURE_2D,se,Re,V.width,V.height)}L&&t.texSubImage2D(s.TEXTURE_2D,0,0,0,pe,Ee,te)}else t.texImage2D(s.TEXTURE_2D,0,Re,pe,Ee,te);m(b)&&u(Z),ye.__version=q.version,b.onUpdate&&b.onUpdate(b)}R.__version=b.version}function ie(R,b,z){if(b.image.length!==6)return;const Z=nt(R,b),Q=b.source;t.bindTexture(s.TEXTURE_CUBE_MAP,R.__webglTexture,s.TEXTURE0+z);const q=i.get(Q);if(Q.version!==q.__version||Z===!0){t.activeTexture(s.TEXTURE0+z);const ye=Ye.getPrimaries(Ye.workingColorSpace),le=b.colorSpace===Ai?null:Ye.getPrimaries(b.colorSpace),fe=b.colorSpace===Ai||ye===le?s.NONE:s.BROWSER_DEFAULT_WEBGL;s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,b.flipY),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,b.premultiplyAlpha),s.pixelStorei(s.UNPACK_ALIGNMENT,b.unpackAlignment),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,fe);const Xe=b.isCompressedTexture||b.image[0].isCompressedTexture,te=b.image[0]&&b.image[0].isDataTexture,pe=[];for(let K=0;K<6;K++)!Xe&&!te?pe[K]=y(b.image[K],!0,n.maxCubemapSize):pe[K]=te?b.image[K].image:b.image[K],pe[K]=rt(b,pe[K]);const Ee=pe[0],Re=r.convert(b.format,b.colorSpace),me=r.convert(b.type),Ge=_(b.internalFormat,Re,me,b.colorSpace),Ue=b.isVideoTexture!==!0,st=q.__version===void 0||Z===!0,L=Q.dataReady;let se=T(b,Ee);Ne(s.TEXTURE_CUBE_MAP,b);let V;if(Xe){Ue&&st&&t.texStorage2D(s.TEXTURE_CUBE_MAP,se,Ge,Ee.width,Ee.height);for(let K=0;K<6;K++){V=pe[K].mipmaps;for(let he=0;he<V.length;he++){const ce=V[he];b.format!==Zt?Re!==null?Ue?L&&t.compressedTexSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+K,he,0,0,ce.width,ce.height,Re,ce.data):t.compressedTexImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+K,he,Ge,ce.width,ce.height,0,ce.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Ue?L&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+K,he,0,0,ce.width,ce.height,Re,me,ce.data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+K,he,Ge,ce.width,ce.height,0,Re,me,ce.data)}}}else{if(V=b.mipmaps,Ue&&st){V.length>0&&se++;const K=xe(pe[0]);t.texStorage2D(s.TEXTURE_CUBE_MAP,se,Ge,K.width,K.height)}for(let K=0;K<6;K++)if(te){Ue?L&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,0,0,pe[K].width,pe[K].height,Re,me,pe[K].data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,Ge,pe[K].width,pe[K].height,0,Re,me,pe[K].data);for(let he=0;he<V.length;he++){const De=V[he].image[K].image;Ue?L&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+K,he+1,0,0,De.width,De.height,Re,me,De.data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+K,he+1,Ge,De.width,De.height,0,Re,me,De.data)}}else{Ue?L&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,0,0,Re,me,pe[K]):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,Ge,Re,me,pe[K]);for(let he=0;he<V.length;he++){const ce=V[he];Ue?L&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+K,he+1,0,0,Re,me,ce.image[K]):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+K,he+1,Ge,Re,me,ce.image[K])}}}m(b)&&u(s.TEXTURE_CUBE_MAP),q.__version=Q.version,b.onUpdate&&b.onUpdate(b)}R.__version=b.version}function ve(R,b,z,Z,Q,q){const ye=r.convert(z.format,z.colorSpace),le=r.convert(z.type),fe=_(z.internalFormat,ye,le,z.colorSpace),Xe=i.get(b),te=i.get(z);if(te.__renderTarget=b,!Xe.__hasExternalTextures){const pe=Math.max(1,b.width>>q),Ee=Math.max(1,b.height>>q);Q===s.TEXTURE_3D||Q===s.TEXTURE_2D_ARRAY?t.texImage3D(Q,q,fe,pe,Ee,b.depth,0,ye,le,null):t.texImage2D(Q,q,fe,pe,Ee,0,ye,le,null)}t.bindFramebuffer(s.FRAMEBUFFER,R),Ve(b)?o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,Z,Q,te.__webglTexture,0,He(b)):(Q===s.TEXTURE_2D||Q>=s.TEXTURE_CUBE_MAP_POSITIVE_X&&Q<=s.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&s.framebufferTexture2D(s.FRAMEBUFFER,Z,Q,te.__webglTexture,q),t.bindFramebuffer(s.FRAMEBUFFER,null)}function oe(R,b,z){if(s.bindRenderbuffer(s.RENDERBUFFER,R),b.depthBuffer){const Z=b.depthTexture,Q=Z&&Z.isDepthTexture?Z.type:null,q=x(b.stencilBuffer,Q),ye=b.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,le=He(b);Ve(b)?o.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,le,q,b.width,b.height):z?s.renderbufferStorageMultisample(s.RENDERBUFFER,le,q,b.width,b.height):s.renderbufferStorage(s.RENDERBUFFER,q,b.width,b.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,ye,s.RENDERBUFFER,R)}else{const Z=b.textures;for(let Q=0;Q<Z.length;Q++){const q=Z[Q],ye=r.convert(q.format,q.colorSpace),le=r.convert(q.type),fe=_(q.internalFormat,ye,le,q.colorSpace),Xe=He(b);z&&Ve(b)===!1?s.renderbufferStorageMultisample(s.RENDERBUFFER,Xe,fe,b.width,b.height):Ve(b)?o.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,Xe,fe,b.width,b.height):s.renderbufferStorage(s.RENDERBUFFER,fe,b.width,b.height)}}s.bindRenderbuffer(s.RENDERBUFFER,null)}function we(R,b){if(b&&b.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(s.FRAMEBUFFER,R),!(b.depthTexture&&b.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const Z=i.get(b.depthTexture);Z.__renderTarget=b,(!Z.__webglTexture||b.depthTexture.image.width!==b.width||b.depthTexture.image.height!==b.height)&&(b.depthTexture.image.width=b.width,b.depthTexture.image.height=b.height,b.depthTexture.needsUpdate=!0),$(b.depthTexture,0);const Q=Z.__webglTexture,q=He(b);if(b.depthTexture.format===En)Ve(b)?o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,s.DEPTH_ATTACHMENT,s.TEXTURE_2D,Q,0,q):s.framebufferTexture2D(s.FRAMEBUFFER,s.DEPTH_ATTACHMENT,s.TEXTURE_2D,Q,0);else if(b.depthTexture.format===In)Ve(b)?o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,s.DEPTH_STENCIL_ATTACHMENT,s.TEXTURE_2D,Q,0,q):s.framebufferTexture2D(s.FRAMEBUFFER,s.DEPTH_STENCIL_ATTACHMENT,s.TEXTURE_2D,Q,0);else throw new Error("Unknown depthTexture format")}function Pe(R){const b=i.get(R),z=R.isWebGLCubeRenderTarget===!0;if(b.__boundDepthTexture!==R.depthTexture){const Z=R.depthTexture;if(b.__depthDisposeCallback&&b.__depthDisposeCallback(),Z){const Q=()=>{delete b.__boundDepthTexture,delete b.__depthDisposeCallback,Z.removeEventListener("dispose",Q)};Z.addEventListener("dispose",Q),b.__depthDisposeCallback=Q}b.__boundDepthTexture=Z}if(R.depthTexture&&!b.__autoAllocateDepthBuffer){if(z)throw new Error("target.depthTexture not supported in Cube render targets");we(b.__webglFramebuffer,R)}else if(z){b.__webglDepthbuffer=[];for(let Z=0;Z<6;Z++)if(t.bindFramebuffer(s.FRAMEBUFFER,b.__webglFramebuffer[Z]),b.__webglDepthbuffer[Z]===void 0)b.__webglDepthbuffer[Z]=s.createRenderbuffer(),oe(b.__webglDepthbuffer[Z],R,!1);else{const Q=R.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,q=b.__webglDepthbuffer[Z];s.bindRenderbuffer(s.RENDERBUFFER,q),s.framebufferRenderbuffer(s.FRAMEBUFFER,Q,s.RENDERBUFFER,q)}}else if(t.bindFramebuffer(s.FRAMEBUFFER,b.__webglFramebuffer),b.__webglDepthbuffer===void 0)b.__webglDepthbuffer=s.createRenderbuffer(),oe(b.__webglDepthbuffer,R,!1);else{const Z=R.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,Q=b.__webglDepthbuffer;s.bindRenderbuffer(s.RENDERBUFFER,Q),s.framebufferRenderbuffer(s.FRAMEBUFFER,Z,s.RENDERBUFFER,Q)}t.bindFramebuffer(s.FRAMEBUFFER,null)}function Oe(R,b,z){const Z=i.get(R);b!==void 0&&ve(Z.__webglFramebuffer,R,R.texture,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,0),z!==void 0&&Pe(R)}function ct(R){const b=R.texture,z=i.get(R),Z=i.get(b);R.addEventListener("dispose",A);const Q=R.textures,q=R.isWebGLCubeRenderTarget===!0,ye=Q.length>1;if(ye||(Z.__webglTexture===void 0&&(Z.__webglTexture=s.createTexture()),Z.__version=b.version,a.memory.textures++),q){z.__webglFramebuffer=[];for(let le=0;le<6;le++)if(b.mipmaps&&b.mipmaps.length>0){z.__webglFramebuffer[le]=[];for(let fe=0;fe<b.mipmaps.length;fe++)z.__webglFramebuffer[le][fe]=s.createFramebuffer()}else z.__webglFramebuffer[le]=s.createFramebuffer()}else{if(b.mipmaps&&b.mipmaps.length>0){z.__webglFramebuffer=[];for(let le=0;le<b.mipmaps.length;le++)z.__webglFramebuffer[le]=s.createFramebuffer()}else z.__webglFramebuffer=s.createFramebuffer();if(ye)for(let le=0,fe=Q.length;le<fe;le++){const Xe=i.get(Q[le]);Xe.__webglTexture===void 0&&(Xe.__webglTexture=s.createTexture(),a.memory.textures++)}if(R.samples>0&&Ve(R)===!1){z.__webglMultisampledFramebuffer=s.createFramebuffer(),z.__webglColorRenderbuffer=[],t.bindFramebuffer(s.FRAMEBUFFER,z.__webglMultisampledFramebuffer);for(let le=0;le<Q.length;le++){const fe=Q[le];z.__webglColorRenderbuffer[le]=s.createRenderbuffer(),s.bindRenderbuffer(s.RENDERBUFFER,z.__webglColorRenderbuffer[le]);const Xe=r.convert(fe.format,fe.colorSpace),te=r.convert(fe.type),pe=_(fe.internalFormat,Xe,te,fe.colorSpace,R.isXRRenderTarget===!0),Ee=He(R);s.renderbufferStorageMultisample(s.RENDERBUFFER,Ee,pe,R.width,R.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+le,s.RENDERBUFFER,z.__webglColorRenderbuffer[le])}s.bindRenderbuffer(s.RENDERBUFFER,null),R.depthBuffer&&(z.__webglDepthRenderbuffer=s.createRenderbuffer(),oe(z.__webglDepthRenderbuffer,R,!0)),t.bindFramebuffer(s.FRAMEBUFFER,null)}}if(q){t.bindTexture(s.TEXTURE_CUBE_MAP,Z.__webglTexture),Ne(s.TEXTURE_CUBE_MAP,b);for(let le=0;le<6;le++)if(b.mipmaps&&b.mipmaps.length>0)for(let fe=0;fe<b.mipmaps.length;fe++)ve(z.__webglFramebuffer[le][fe],R,b,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+le,fe);else ve(z.__webglFramebuffer[le],R,b,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+le,0);m(b)&&u(s.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(ye){for(let le=0,fe=Q.length;le<fe;le++){const Xe=Q[le],te=i.get(Xe);t.bindTexture(s.TEXTURE_2D,te.__webglTexture),Ne(s.TEXTURE_2D,Xe),ve(z.__webglFramebuffer,R,Xe,s.COLOR_ATTACHMENT0+le,s.TEXTURE_2D,0),m(Xe)&&u(s.TEXTURE_2D)}t.unbindTexture()}else{let le=s.TEXTURE_2D;if((R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(le=R.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),t.bindTexture(le,Z.__webglTexture),Ne(le,b),b.mipmaps&&b.mipmaps.length>0)for(let fe=0;fe<b.mipmaps.length;fe++)ve(z.__webglFramebuffer[fe],R,b,s.COLOR_ATTACHMENT0,le,fe);else ve(z.__webglFramebuffer,R,b,s.COLOR_ATTACHMENT0,le,0);m(b)&&u(le),t.unbindTexture()}R.depthBuffer&&Pe(R)}function We(R){const b=R.textures;for(let z=0,Z=b.length;z<Z;z++){const Q=b[z];if(m(Q)){const q=v(R),ye=i.get(Q).__webglTexture;t.bindTexture(q,ye),u(q),t.unbindTexture()}}}const pt=[],D=[];function Gt(R){if(R.samples>0){if(Ve(R)===!1){const b=R.textures,z=R.width,Z=R.height;let Q=s.COLOR_BUFFER_BIT;const q=R.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,ye=i.get(R),le=b.length>1;if(le)for(let fe=0;fe<b.length;fe++)t.bindFramebuffer(s.FRAMEBUFFER,ye.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+fe,s.RENDERBUFFER,null),t.bindFramebuffer(s.FRAMEBUFFER,ye.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+fe,s.TEXTURE_2D,null,0);t.bindFramebuffer(s.READ_FRAMEBUFFER,ye.__webglMultisampledFramebuffer),t.bindFramebuffer(s.DRAW_FRAMEBUFFER,ye.__webglFramebuffer);for(let fe=0;fe<b.length;fe++){if(R.resolveDepthBuffer&&(R.depthBuffer&&(Q|=s.DEPTH_BUFFER_BIT),R.stencilBuffer&&R.resolveStencilBuffer&&(Q|=s.STENCIL_BUFFER_BIT)),le){s.framebufferRenderbuffer(s.READ_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.RENDERBUFFER,ye.__webglColorRenderbuffer[fe]);const Xe=i.get(b[fe]).__webglTexture;s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,Xe,0)}s.blitFramebuffer(0,0,z,Z,0,0,z,Z,Q,s.NEAREST),l===!0&&(pt.length=0,D.length=0,pt.push(s.COLOR_ATTACHMENT0+fe),R.depthBuffer&&R.resolveDepthBuffer===!1&&(pt.push(q),D.push(q),s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,D)),s.invalidateFramebuffer(s.READ_FRAMEBUFFER,pt))}if(t.bindFramebuffer(s.READ_FRAMEBUFFER,null),t.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),le)for(let fe=0;fe<b.length;fe++){t.bindFramebuffer(s.FRAMEBUFFER,ye.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+fe,s.RENDERBUFFER,ye.__webglColorRenderbuffer[fe]);const Xe=i.get(b[fe]).__webglTexture;t.bindFramebuffer(s.FRAMEBUFFER,ye.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+fe,s.TEXTURE_2D,Xe,0)}t.bindFramebuffer(s.DRAW_FRAMEBUFFER,ye.__webglMultisampledFramebuffer)}else if(R.depthBuffer&&R.resolveDepthBuffer===!1&&l){const b=R.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,[b])}}}function He(R){return Math.min(n.maxSamples,R.samples)}function Ve(R){const b=i.get(R);return R.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&b.__useRenderToTexture!==!1}function be(R){const b=a.render.frame;h.get(R)!==b&&(h.set(R,b),R.update())}function rt(R,b){const z=R.colorSpace,Z=R.format,Q=R.type;return R.isCompressedTexture===!0||R.isVideoTexture===!0||z!==Dn&&z!==Ai&&(Ye.getTransfer(z)===tt?(Z!==Zt||Q!==_i)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",z)),b}function xe(R){return typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement?(c.width=R.naturalWidth||R.width,c.height=R.naturalHeight||R.height):typeof VideoFrame<"u"&&R instanceof VideoFrame?(c.width=R.displayWidth,c.height=R.displayHeight):(c.width=R.width,c.height=R.height),c}this.allocateTextureUnit=N,this.resetTextureUnits=F,this.setTexture2D=$,this.setTexture2DArray=X,this.setTexture3D=j,this.setTextureCube=G,this.rebindTextures=Oe,this.setupRenderTarget=ct,this.updateRenderTargetMipmap=We,this.updateMultisampleRenderTarget=Gt,this.setupDepthRenderbuffer=Pe,this.setupFrameBufferTexture=ve,this.useMultisampledRTT=Ve}function eg(s,e){function t(i,n=Ai){let r;const a=Ye.getTransfer(n);if(i===_i)return s.UNSIGNED_BYTE;if(i===za)return s.UNSIGNED_SHORT_4_4_4_4;if(i===ka)return s.UNSIGNED_SHORT_5_5_5_1;if(i===$l)return s.UNSIGNED_INT_5_9_9_9_REV;if(i===Xl)return s.BYTE;if(i===ql)return s.SHORT;if(i===is)return s.UNSIGNED_SHORT;if(i===Oa)return s.INT;if(i===Zi)return s.UNSIGNED_INT;if(i===ai)return s.FLOAT;if(i===as)return s.HALF_FLOAT;if(i===Yl)return s.ALPHA;if(i===Zl)return s.RGB;if(i===Zt)return s.RGBA;if(i===Kl)return s.LUMINANCE;if(i===jl)return s.LUMINANCE_ALPHA;if(i===En)return s.DEPTH_COMPONENT;if(i===In)return s.DEPTH_STENCIL;if(i===Ha)return s.RED;if(i===Va)return s.RED_INTEGER;if(i===Ql)return s.RG;if(i===Ga)return s.RG_INTEGER;if(i===Wa)return s.RGBA_INTEGER;if(i===Gs||i===Ws||i===Xs||i===qs)if(a===tt)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(i===Gs)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===Ws)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===Xs)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===qs)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(i===Gs)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===Ws)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===Xs)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===qs)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===ra||i===aa||i===oa||i===la)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(i===ra)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===aa)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===oa)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===la)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===ca||i===ha||i===ua)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(i===ca||i===ha)return a===tt?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(i===ua)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(i===da||i===fa||i===pa||i===ma||i===ga||i===va||i===ya||i===xa||i===_a||i===ba||i===Sa||i===Ma||i===Ea||i===wa)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(i===da)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===fa)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===pa)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===ma)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===ga)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===va)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===ya)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===xa)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===_a)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===ba)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===Sa)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===Ma)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===Ea)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===wa)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===$s||i===Ta||i===Ra)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(i===$s)return a===tt?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===Ta)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===Ra)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===Jl||i===Ca||i===Aa||i===Pa)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(i===$s)return r.COMPRESSED_RED_RGTC1_EXT;if(i===Ca)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===Aa)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===Pa)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===Pn?s.UNSIGNED_INT_24_8:s[i]!==void 0?s[i]:null}return{convert:t}}const tg={type:"move"};class Wr{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new gi,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new gi,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new w,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new w),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new gi,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new w,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new w),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let n=null,r=null,a=null;const o=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){a=!0;for(const y of e.hand.values()){const m=t.getJointPose(y,i),u=this._getHandJoint(c,y);m!==null&&(u.matrix.fromArray(m.transform.matrix),u.matrix.decompose(u.position,u.rotation,u.scale),u.matrixWorldNeedsUpdate=!0,u.jointRadius=m.radius),u.visible=m!==null}const h=c.joints["index-finger-tip"],d=c.joints["thumb-tip"],f=h.position.distanceTo(d.position),p=.02,g=.005;c.inputState.pinching&&f>p+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&f<=p-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,i),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));o!==null&&(n=t.getPose(e.targetRaySpace,i),n===null&&r!==null&&(n=r),n!==null&&(o.matrix.fromArray(n.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,n.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(n.linearVelocity)):o.hasLinearVelocity=!1,n.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(n.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(tg)))}return o!==null&&(o.visible=n!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const i=new gi;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}}const ig=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,ng=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class sg{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t,i){if(this.texture===null){const n=new Mt,r=e.properties.get(n);r.__webglTexture=t.texture,(t.depthNear!==i.depthNear||t.depthFar!==i.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,i=new dt({vertexShader:ig,fragmentShader:ng,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new at(new Yi(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class rg extends Fn{constructor(e,t){super();const i=this;let n=null,r=1,a=null,o="local-floor",l=1,c=null,h=null,d=null,f=null,p=null,g=null;const y=new sg,m=t.getContextAttributes();let u=null,v=null;const _=[],x=[],T=new Te;let C=null;const A=new kt;A.viewport=new it;const P=new kt;P.viewport=new it;const M=[A,P],S=new Eu;let I=null,F=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(Y){let ie=_[Y];return ie===void 0&&(ie=new Wr,_[Y]=ie),ie.getTargetRaySpace()},this.getControllerGrip=function(Y){let ie=_[Y];return ie===void 0&&(ie=new Wr,_[Y]=ie),ie.getGripSpace()},this.getHand=function(Y){let ie=_[Y];return ie===void 0&&(ie=new Wr,_[Y]=ie),ie.getHandSpace()};function N(Y){const ie=x.indexOf(Y.inputSource);if(ie===-1)return;const ve=_[ie];ve!==void 0&&(ve.update(Y.inputSource,Y.frame,c||a),ve.dispatchEvent({type:Y.type,data:Y.inputSource}))}function W(){n.removeEventListener("select",N),n.removeEventListener("selectstart",N),n.removeEventListener("selectend",N),n.removeEventListener("squeeze",N),n.removeEventListener("squeezestart",N),n.removeEventListener("squeezeend",N),n.removeEventListener("end",W),n.removeEventListener("inputsourceschange",$);for(let Y=0;Y<_.length;Y++){const ie=x[Y];ie!==null&&(x[Y]=null,_[Y].disconnect(ie))}I=null,F=null,y.reset(),e.setRenderTarget(u),p=null,f=null,d=null,n=null,v=null,nt.stop(),i.isPresenting=!1,e.setPixelRatio(C),e.setSize(T.width,T.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(Y){r=Y,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(Y){o=Y,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(Y){c=Y},this.getBaseLayer=function(){return f!==null?f:p},this.getBinding=function(){return d},this.getFrame=function(){return g},this.getSession=function(){return n},this.setSession=async function(Y){if(n=Y,n!==null){if(u=e.getRenderTarget(),n.addEventListener("select",N),n.addEventListener("selectstart",N),n.addEventListener("selectend",N),n.addEventListener("squeeze",N),n.addEventListener("squeezestart",N),n.addEventListener("squeezeend",N),n.addEventListener("end",W),n.addEventListener("inputsourceschange",$),m.xrCompatible!==!0&&await t.makeXRCompatible(),C=e.getPixelRatio(),e.getSize(T),n.enabledFeatures!==void 0&&n.enabledFeatures.includes("layers")){let ve=null,oe=null,we=null;m.depth&&(we=m.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,ve=m.stencil?In:En,oe=m.stencil?Pn:Zi);const Pe={colorFormat:t.RGBA8,depthFormat:we,scaleFactor:r};d=new XRWebGLBinding(n,t),f=d.createProjectionLayer(Pe),n.updateRenderState({layers:[f]}),e.setPixelRatio(1),e.setSize(f.textureWidth,f.textureHeight,!1),v=new Ki(f.textureWidth,f.textureHeight,{format:Zt,type:_i,depthTexture:new dc(f.textureWidth,f.textureHeight,oe,void 0,void 0,void 0,void 0,void 0,void 0,ve),stencilBuffer:m.stencil,colorSpace:e.outputColorSpace,samples:m.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1})}else{const ve={antialias:m.antialias,alpha:!0,depth:m.depth,stencil:m.stencil,framebufferScaleFactor:r};p=new XRWebGLLayer(n,t,ve),n.updateRenderState({baseLayer:p}),e.setPixelRatio(1),e.setSize(p.framebufferWidth,p.framebufferHeight,!1),v=new Ki(p.framebufferWidth,p.framebufferHeight,{format:Zt,type:_i,colorSpace:e.outputColorSpace,stencilBuffer:m.stencil})}v.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await n.requestReferenceSpace(o),nt.setContext(n),nt.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(n!==null)return n.environmentBlendMode},this.getDepthTexture=function(){return y.getDepthTexture()};function $(Y){for(let ie=0;ie<Y.removed.length;ie++){const ve=Y.removed[ie],oe=x.indexOf(ve);oe>=0&&(x[oe]=null,_[oe].disconnect(ve))}for(let ie=0;ie<Y.added.length;ie++){const ve=Y.added[ie];let oe=x.indexOf(ve);if(oe===-1){for(let Pe=0;Pe<_.length;Pe++)if(Pe>=x.length){x.push(ve),oe=Pe;break}else if(x[Pe]===null){x[Pe]=ve,oe=Pe;break}if(oe===-1)break}const we=_[oe];we&&we.connect(ve)}}const X=new w,j=new w;function G(Y,ie,ve){X.setFromMatrixPosition(ie.matrixWorld),j.setFromMatrixPosition(ve.matrixWorld);const oe=X.distanceTo(j),we=ie.projectionMatrix.elements,Pe=ve.projectionMatrix.elements,Oe=we[14]/(we[10]-1),ct=we[14]/(we[10]+1),We=(we[9]+1)/we[5],pt=(we[9]-1)/we[5],D=(we[8]-1)/we[0],Gt=(Pe[8]+1)/Pe[0],He=Oe*D,Ve=Oe*Gt,be=oe/(-D+Gt),rt=be*-D;if(ie.matrixWorld.decompose(Y.position,Y.quaternion,Y.scale),Y.translateX(rt),Y.translateZ(be),Y.matrixWorld.compose(Y.position,Y.quaternion,Y.scale),Y.matrixWorldInverse.copy(Y.matrixWorld).invert(),we[10]===-1)Y.projectionMatrix.copy(ie.projectionMatrix),Y.projectionMatrixInverse.copy(ie.projectionMatrixInverse);else{const xe=Oe+be,R=ct+be,b=He-rt,z=Ve+(oe-rt),Z=We*ct/R*xe,Q=pt*ct/R*xe;Y.projectionMatrix.makePerspective(b,z,Z,Q,xe,R),Y.projectionMatrixInverse.copy(Y.projectionMatrix).invert()}}function ae(Y,ie){ie===null?Y.matrixWorld.copy(Y.matrix):Y.matrixWorld.multiplyMatrices(ie.matrixWorld,Y.matrix),Y.matrixWorldInverse.copy(Y.matrixWorld).invert()}this.updateCamera=function(Y){if(n===null)return;let ie=Y.near,ve=Y.far;y.texture!==null&&(y.depthNear>0&&(ie=y.depthNear),y.depthFar>0&&(ve=y.depthFar)),S.near=P.near=A.near=ie,S.far=P.far=A.far=ve,(I!==S.near||F!==S.far)&&(n.updateRenderState({depthNear:S.near,depthFar:S.far}),I=S.near,F=S.far),A.layers.mask=Y.layers.mask|2,P.layers.mask=Y.layers.mask|4,S.layers.mask=A.layers.mask|P.layers.mask;const oe=Y.parent,we=S.cameras;ae(S,oe);for(let Pe=0;Pe<we.length;Pe++)ae(we[Pe],oe);we.length===2?G(S,A,P):S.projectionMatrix.copy(A.projectionMatrix),de(Y,S,oe)};function de(Y,ie,ve){ve===null?Y.matrix.copy(ie.matrixWorld):(Y.matrix.copy(ve.matrixWorld),Y.matrix.invert(),Y.matrix.multiply(ie.matrixWorld)),Y.matrix.decompose(Y.position,Y.quaternion,Y.scale),Y.updateMatrixWorld(!0),Y.projectionMatrix.copy(ie.projectionMatrix),Y.projectionMatrixInverse.copy(ie.projectionMatrixInverse),Y.isPerspectiveCamera&&(Y.fov=ns*2*Math.atan(1/Y.projectionMatrix.elements[5]),Y.zoom=1)}this.getCamera=function(){return S},this.getFoveation=function(){if(!(f===null&&p===null))return l},this.setFoveation=function(Y){l=Y,f!==null&&(f.fixedFoveation=Y),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=Y)},this.hasDepthSensing=function(){return y.texture!==null},this.getDepthSensingMesh=function(){return y.getMesh(S)};let _e=null;function Ne(Y,ie){if(h=ie.getViewerPose(c||a),g=ie,h!==null){const ve=h.views;p!==null&&(e.setRenderTargetFramebuffer(v,p.framebuffer),e.setRenderTarget(v));let oe=!1;ve.length!==S.cameras.length&&(S.cameras.length=0,oe=!0);for(let Pe=0;Pe<ve.length;Pe++){const Oe=ve[Pe];let ct=null;if(p!==null)ct=p.getViewport(Oe);else{const pt=d.getViewSubImage(f,Oe);ct=pt.viewport,Pe===0&&(e.setRenderTargetTextures(v,pt.colorTexture,f.ignoreDepthValues?void 0:pt.depthStencilTexture),e.setRenderTarget(v))}let We=M[Pe];We===void 0&&(We=new kt,We.layers.enable(Pe),We.viewport=new it,M[Pe]=We),We.matrix.fromArray(Oe.transform.matrix),We.matrix.decompose(We.position,We.quaternion,We.scale),We.projectionMatrix.fromArray(Oe.projectionMatrix),We.projectionMatrixInverse.copy(We.projectionMatrix).invert(),We.viewport.set(ct.x,ct.y,ct.width,ct.height),Pe===0&&(S.matrix.copy(We.matrix),S.matrix.decompose(S.position,S.quaternion,S.scale)),oe===!0&&S.cameras.push(We)}const we=n.enabledFeatures;if(we&&we.includes("depth-sensing")){const Pe=d.getDepthInformation(ve[0]);Pe&&Pe.isValid&&Pe.texture&&y.init(e,Pe,n.renderState)}}for(let ve=0;ve<_.length;ve++){const oe=x[ve],we=_[ve];oe!==null&&we!==void 0&&we.update(oe,ie,c||a)}_e&&_e(Y,ie),ie.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:ie}),g=null}const nt=new pc;nt.setAnimationLoop(Ne),this.setAnimationLoop=function(Y){_e=Y},this.dispose=function(){}}}const Hi=new ni,ag=new Ke;function og(s,e){function t(m,u){m.matrixAutoUpdate===!0&&m.updateMatrix(),u.value.copy(m.matrix)}function i(m,u){u.color.getRGB(m.fogColor.value,oc(s)),u.isFog?(m.fogNear.value=u.near,m.fogFar.value=u.far):u.isFogExp2&&(m.fogDensity.value=u.density)}function n(m,u,v,_,x){u.isMeshBasicMaterial||u.isMeshLambertMaterial?r(m,u):u.isMeshToonMaterial?(r(m,u),d(m,u)):u.isMeshPhongMaterial?(r(m,u),h(m,u)):u.isMeshStandardMaterial?(r(m,u),f(m,u),u.isMeshPhysicalMaterial&&p(m,u,x)):u.isMeshMatcapMaterial?(r(m,u),g(m,u)):u.isMeshDepthMaterial?r(m,u):u.isMeshDistanceMaterial?(r(m,u),y(m,u)):u.isMeshNormalMaterial?r(m,u):u.isLineBasicMaterial?(a(m,u),u.isLineDashedMaterial&&o(m,u)):u.isPointsMaterial?l(m,u,v,_):u.isSpriteMaterial?c(m,u):u.isShadowMaterial?(m.color.value.copy(u.color),m.opacity.value=u.opacity):u.isShaderMaterial&&(u.uniformsNeedUpdate=!1)}function r(m,u){m.opacity.value=u.opacity,u.color&&m.diffuse.value.copy(u.color),u.emissive&&m.emissive.value.copy(u.emissive).multiplyScalar(u.emissiveIntensity),u.map&&(m.map.value=u.map,t(u.map,m.mapTransform)),u.alphaMap&&(m.alphaMap.value=u.alphaMap,t(u.alphaMap,m.alphaMapTransform)),u.bumpMap&&(m.bumpMap.value=u.bumpMap,t(u.bumpMap,m.bumpMapTransform),m.bumpScale.value=u.bumpScale,u.side===Ut&&(m.bumpScale.value*=-1)),u.normalMap&&(m.normalMap.value=u.normalMap,t(u.normalMap,m.normalMapTransform),m.normalScale.value.copy(u.normalScale),u.side===Ut&&m.normalScale.value.negate()),u.displacementMap&&(m.displacementMap.value=u.displacementMap,t(u.displacementMap,m.displacementMapTransform),m.displacementScale.value=u.displacementScale,m.displacementBias.value=u.displacementBias),u.emissiveMap&&(m.emissiveMap.value=u.emissiveMap,t(u.emissiveMap,m.emissiveMapTransform)),u.specularMap&&(m.specularMap.value=u.specularMap,t(u.specularMap,m.specularMapTransform)),u.alphaTest>0&&(m.alphaTest.value=u.alphaTest);const v=e.get(u),_=v.envMap,x=v.envMapRotation;_&&(m.envMap.value=_,Hi.copy(x),Hi.x*=-1,Hi.y*=-1,Hi.z*=-1,_.isCubeTexture&&_.isRenderTargetTexture===!1&&(Hi.y*=-1,Hi.z*=-1),m.envMapRotation.value.setFromMatrix4(ag.makeRotationFromEuler(Hi)),m.flipEnvMap.value=_.isCubeTexture&&_.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=u.reflectivity,m.ior.value=u.ior,m.refractionRatio.value=u.refractionRatio),u.lightMap&&(m.lightMap.value=u.lightMap,m.lightMapIntensity.value=u.lightMapIntensity,t(u.lightMap,m.lightMapTransform)),u.aoMap&&(m.aoMap.value=u.aoMap,m.aoMapIntensity.value=u.aoMapIntensity,t(u.aoMap,m.aoMapTransform))}function a(m,u){m.diffuse.value.copy(u.color),m.opacity.value=u.opacity,u.map&&(m.map.value=u.map,t(u.map,m.mapTransform))}function o(m,u){m.dashSize.value=u.dashSize,m.totalSize.value=u.dashSize+u.gapSize,m.scale.value=u.scale}function l(m,u,v,_){m.diffuse.value.copy(u.color),m.opacity.value=u.opacity,m.size.value=u.size*v,m.scale.value=_*.5,u.map&&(m.map.value=u.map,t(u.map,m.uvTransform)),u.alphaMap&&(m.alphaMap.value=u.alphaMap,t(u.alphaMap,m.alphaMapTransform)),u.alphaTest>0&&(m.alphaTest.value=u.alphaTest)}function c(m,u){m.diffuse.value.copy(u.color),m.opacity.value=u.opacity,m.rotation.value=u.rotation,u.map&&(m.map.value=u.map,t(u.map,m.mapTransform)),u.alphaMap&&(m.alphaMap.value=u.alphaMap,t(u.alphaMap,m.alphaMapTransform)),u.alphaTest>0&&(m.alphaTest.value=u.alphaTest)}function h(m,u){m.specular.value.copy(u.specular),m.shininess.value=Math.max(u.shininess,1e-4)}function d(m,u){u.gradientMap&&(m.gradientMap.value=u.gradientMap)}function f(m,u){m.metalness.value=u.metalness,u.metalnessMap&&(m.metalnessMap.value=u.metalnessMap,t(u.metalnessMap,m.metalnessMapTransform)),m.roughness.value=u.roughness,u.roughnessMap&&(m.roughnessMap.value=u.roughnessMap,t(u.roughnessMap,m.roughnessMapTransform)),u.envMap&&(m.envMapIntensity.value=u.envMapIntensity)}function p(m,u,v){m.ior.value=u.ior,u.sheen>0&&(m.sheenColor.value.copy(u.sheenColor).multiplyScalar(u.sheen),m.sheenRoughness.value=u.sheenRoughness,u.sheenColorMap&&(m.sheenColorMap.value=u.sheenColorMap,t(u.sheenColorMap,m.sheenColorMapTransform)),u.sheenRoughnessMap&&(m.sheenRoughnessMap.value=u.sheenRoughnessMap,t(u.sheenRoughnessMap,m.sheenRoughnessMapTransform))),u.clearcoat>0&&(m.clearcoat.value=u.clearcoat,m.clearcoatRoughness.value=u.clearcoatRoughness,u.clearcoatMap&&(m.clearcoatMap.value=u.clearcoatMap,t(u.clearcoatMap,m.clearcoatMapTransform)),u.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=u.clearcoatRoughnessMap,t(u.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),u.clearcoatNormalMap&&(m.clearcoatNormalMap.value=u.clearcoatNormalMap,t(u.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(u.clearcoatNormalScale),u.side===Ut&&m.clearcoatNormalScale.value.negate())),u.dispersion>0&&(m.dispersion.value=u.dispersion),u.iridescence>0&&(m.iridescence.value=u.iridescence,m.iridescenceIOR.value=u.iridescenceIOR,m.iridescenceThicknessMinimum.value=u.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=u.iridescenceThicknessRange[1],u.iridescenceMap&&(m.iridescenceMap.value=u.iridescenceMap,t(u.iridescenceMap,m.iridescenceMapTransform)),u.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=u.iridescenceThicknessMap,t(u.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),u.transmission>0&&(m.transmission.value=u.transmission,m.transmissionSamplerMap.value=v.texture,m.transmissionSamplerSize.value.set(v.width,v.height),u.transmissionMap&&(m.transmissionMap.value=u.transmissionMap,t(u.transmissionMap,m.transmissionMapTransform)),m.thickness.value=u.thickness,u.thicknessMap&&(m.thicknessMap.value=u.thicknessMap,t(u.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=u.attenuationDistance,m.attenuationColor.value.copy(u.attenuationColor)),u.anisotropy>0&&(m.anisotropyVector.value.set(u.anisotropy*Math.cos(u.anisotropyRotation),u.anisotropy*Math.sin(u.anisotropyRotation)),u.anisotropyMap&&(m.anisotropyMap.value=u.anisotropyMap,t(u.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=u.specularIntensity,m.specularColor.value.copy(u.specularColor),u.specularColorMap&&(m.specularColorMap.value=u.specularColorMap,t(u.specularColorMap,m.specularColorMapTransform)),u.specularIntensityMap&&(m.specularIntensityMap.value=u.specularIntensityMap,t(u.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,u){u.matcap&&(m.matcap.value=u.matcap)}function y(m,u){const v=e.get(u).light;m.referencePosition.value.setFromMatrixPosition(v.matrixWorld),m.nearDistance.value=v.shadow.camera.near,m.farDistance.value=v.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:n}}function lg(s,e,t,i){let n={},r={},a=[];const o=s.getParameter(s.MAX_UNIFORM_BUFFER_BINDINGS);function l(v,_){const x=_.program;i.uniformBlockBinding(v,x)}function c(v,_){let x=n[v.id];x===void 0&&(g(v),x=h(v),n[v.id]=x,v.addEventListener("dispose",m));const T=_.program;i.updateUBOMapping(v,T);const C=e.render.frame;r[v.id]!==C&&(f(v),r[v.id]=C)}function h(v){const _=d();v.__bindingPointIndex=_;const x=s.createBuffer(),T=v.__size,C=v.usage;return s.bindBuffer(s.UNIFORM_BUFFER,x),s.bufferData(s.UNIFORM_BUFFER,T,C),s.bindBuffer(s.UNIFORM_BUFFER,null),s.bindBufferBase(s.UNIFORM_BUFFER,_,x),x}function d(){for(let v=0;v<o;v++)if(a.indexOf(v)===-1)return a.push(v),v;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function f(v){const _=n[v.id],x=v.uniforms,T=v.__cache;s.bindBuffer(s.UNIFORM_BUFFER,_);for(let C=0,A=x.length;C<A;C++){const P=Array.isArray(x[C])?x[C]:[x[C]];for(let M=0,S=P.length;M<S;M++){const I=P[M];if(p(I,C,M,T)===!0){const F=I.__offset,N=Array.isArray(I.value)?I.value:[I.value];let W=0;for(let $=0;$<N.length;$++){const X=N[$],j=y(X);typeof X=="number"||typeof X=="boolean"?(I.__data[0]=X,s.bufferSubData(s.UNIFORM_BUFFER,F+W,I.__data)):X.isMatrix3?(I.__data[0]=X.elements[0],I.__data[1]=X.elements[1],I.__data[2]=X.elements[2],I.__data[3]=0,I.__data[4]=X.elements[3],I.__data[5]=X.elements[4],I.__data[6]=X.elements[5],I.__data[7]=0,I.__data[8]=X.elements[6],I.__data[9]=X.elements[7],I.__data[10]=X.elements[8],I.__data[11]=0):(X.toArray(I.__data,W),W+=j.storage/Float32Array.BYTES_PER_ELEMENT)}s.bufferSubData(s.UNIFORM_BUFFER,F,I.__data)}}}s.bindBuffer(s.UNIFORM_BUFFER,null)}function p(v,_,x,T){const C=v.value,A=_+"_"+x;if(T[A]===void 0)return typeof C=="number"||typeof C=="boolean"?T[A]=C:T[A]=C.clone(),!0;{const P=T[A];if(typeof C=="number"||typeof C=="boolean"){if(P!==C)return T[A]=C,!0}else if(P.equals(C)===!1)return P.copy(C),!0}return!1}function g(v){const _=v.uniforms;let x=0;const T=16;for(let A=0,P=_.length;A<P;A++){const M=Array.isArray(_[A])?_[A]:[_[A]];for(let S=0,I=M.length;S<I;S++){const F=M[S],N=Array.isArray(F.value)?F.value:[F.value];for(let W=0,$=N.length;W<$;W++){const X=N[W],j=y(X),G=x%T,ae=G%j.boundary,de=G+ae;x+=ae,de!==0&&T-de<j.storage&&(x+=T-de),F.__data=new Float32Array(j.storage/Float32Array.BYTES_PER_ELEMENT),F.__offset=x,x+=j.storage}}}const C=x%T;return C>0&&(x+=T-C),v.__size=x,v.__cache={},this}function y(v){const _={boundary:0,storage:0};return typeof v=="number"||typeof v=="boolean"?(_.boundary=4,_.storage=4):v.isVector2?(_.boundary=8,_.storage=8):v.isVector3||v.isColor?(_.boundary=16,_.storage=12):v.isVector4?(_.boundary=16,_.storage=16):v.isMatrix3?(_.boundary=48,_.storage=48):v.isMatrix4?(_.boundary=64,_.storage=64):v.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",v),_}function m(v){const _=v.target;_.removeEventListener("dispose",m);const x=a.indexOf(_.__bindingPointIndex);a.splice(x,1),s.deleteBuffer(n[_.id]),delete n[_.id],delete r[_.id]}function u(){for(const v in n)s.deleteBuffer(n[v]);a=[],n={},r={}}return{bind:l,update:c,dispose:u}}class cg{constructor(e={}){const{canvas:t=Lh(),context:i=null,depth:n=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:d=!1,reverseDepthBuffer:f=!1}=e;this.isWebGLRenderer=!0;let p;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");p=i.getContextAttributes().alpha}else p=a;const g=new Uint32Array(4),y=new Int32Array(4);let m=null,u=null;const v=[],_=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=Dt,this.toneMapping=Di,this.toneMappingExposure=1;const x=this;let T=!1,C=0,A=0,P=null,M=-1,S=null;const I=new it,F=new it;let N=null;const W=new Ae(0);let $=0,X=t.width,j=t.height,G=1,ae=null,de=null;const _e=new it(0,0,X,j),Ne=new it(0,0,X,j);let nt=!1;const Y=new Ya;let ie=!1,ve=!1;this.transmissionResolutionScale=1;const oe=new Ke,we=new Ke,Pe=new w,Oe=new it,ct={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let We=!1;function pt(){return P===null?G:1}let D=i;function Gt(E,U){return t.getContext(E,U)}try{const E={alpha:!0,depth:n,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:d};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${Ba}`),t.addEventListener("webglcontextlost",K,!1),t.addEventListener("webglcontextrestored",he,!1),t.addEventListener("webglcontextcreationerror",ce,!1),D===null){const U="webgl2";if(D=Gt(U,E),D===null)throw Gt(U)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(E){throw console.error("THREE.WebGLRenderer: "+E.message),E}let He,Ve,be,rt,xe,R,b,z,Z,Q,q,ye,le,fe,Xe,te,pe,Ee,Re,me,Ge,Ue,st,L;function se(){He=new yp(D),He.init(),Ue=new eg(D,He),Ve=new dp(D,He,e,Ue),be=new Qm(D,He),Ve.reverseDepthBuffer&&f&&be.buffers.depth.setReversed(!0),rt=new bp(D),xe=new zm,R=new Jm(D,He,be,xe,Ve,Ue,rt),b=new pp(x),z=new vp(x),Z=new Ru(D),st=new hp(D,Z),Q=new xp(D,Z,rt,st),q=new Mp(D,Q,Z,rt),Re=new Sp(D,Ve,R),te=new fp(xe),ye=new Om(x,b,z,He,Ve,st,te),le=new og(x,xe),fe=new Hm,Xe=new $m(He),Ee=new cp(x,b,z,be,q,p,l),pe=new Km(x,q,Ve),L=new lg(D,rt,Ve,be),me=new up(D,He,rt),Ge=new _p(D,He,rt),rt.programs=ye.programs,x.capabilities=Ve,x.extensions=He,x.properties=xe,x.renderLists=fe,x.shadowMap=pe,x.state=be,x.info=rt}se();const V=new rg(x,D);this.xr=V,this.getContext=function(){return D},this.getContextAttributes=function(){return D.getContextAttributes()},this.forceContextLoss=function(){const E=He.get("WEBGL_lose_context");E&&E.loseContext()},this.forceContextRestore=function(){const E=He.get("WEBGL_lose_context");E&&E.restoreContext()},this.getPixelRatio=function(){return G},this.setPixelRatio=function(E){E!==void 0&&(G=E,this.setSize(X,j,!1))},this.getSize=function(E){return E.set(X,j)},this.setSize=function(E,U,k=!0){if(V.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}X=E,j=U,t.width=Math.floor(E*G),t.height=Math.floor(U*G),k===!0&&(t.style.width=E+"px",t.style.height=U+"px"),this.setViewport(0,0,E,U)},this.getDrawingBufferSize=function(E){return E.set(X*G,j*G).floor()},this.setDrawingBufferSize=function(E,U,k){X=E,j=U,G=k,t.width=Math.floor(E*k),t.height=Math.floor(U*k),this.setViewport(0,0,E,U)},this.getCurrentViewport=function(E){return E.copy(I)},this.getViewport=function(E){return E.copy(_e)},this.setViewport=function(E,U,k,H){E.isVector4?_e.set(E.x,E.y,E.z,E.w):_e.set(E,U,k,H),be.viewport(I.copy(_e).multiplyScalar(G).round())},this.getScissor=function(E){return E.copy(Ne)},this.setScissor=function(E,U,k,H){E.isVector4?Ne.set(E.x,E.y,E.z,E.w):Ne.set(E,U,k,H),be.scissor(F.copy(Ne).multiplyScalar(G).round())},this.getScissorTest=function(){return nt},this.setScissorTest=function(E){be.setScissorTest(nt=E)},this.setOpaqueSort=function(E){ae=E},this.setTransparentSort=function(E){de=E},this.getClearColor=function(E){return E.copy(Ee.getClearColor())},this.setClearColor=function(){Ee.setClearColor.apply(Ee,arguments)},this.getClearAlpha=function(){return Ee.getClearAlpha()},this.setClearAlpha=function(){Ee.setClearAlpha.apply(Ee,arguments)},this.clear=function(E=!0,U=!0,k=!0){let H=0;if(E){let B=!1;if(P!==null){const J=P.texture.format;B=J===Wa||J===Ga||J===Va}if(B){const J=P.texture.type,re=J===_i||J===Zi||J===is||J===Pn||J===za||J===ka,ue=Ee.getClearColor(),ge=Ee.getClearAlpha(),Ce=ue.r,Ie=ue.g,Se=ue.b;re?(g[0]=Ce,g[1]=Ie,g[2]=Se,g[3]=ge,D.clearBufferuiv(D.COLOR,0,g)):(y[0]=Ce,y[1]=Ie,y[2]=Se,y[3]=ge,D.clearBufferiv(D.COLOR,0,y))}else H|=D.COLOR_BUFFER_BIT}U&&(H|=D.DEPTH_BUFFER_BIT),k&&(H|=D.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),D.clear(H)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",K,!1),t.removeEventListener("webglcontextrestored",he,!1),t.removeEventListener("webglcontextcreationerror",ce,!1),Ee.dispose(),fe.dispose(),Xe.dispose(),xe.dispose(),b.dispose(),z.dispose(),q.dispose(),st.dispose(),L.dispose(),ye.dispose(),V.dispose(),V.removeEventListener("sessionstart",to),V.removeEventListener("sessionend",io),Fi.stop()};function K(E){E.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),T=!0}function he(){console.log("THREE.WebGLRenderer: Context Restored."),T=!1;const E=rt.autoReset,U=pe.enabled,k=pe.autoUpdate,H=pe.needsUpdate,B=pe.type;se(),rt.autoReset=E,pe.enabled=U,pe.autoUpdate=k,pe.needsUpdate=H,pe.type=B}function ce(E){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",E.statusMessage)}function De(E){const U=E.target;U.removeEventListener("dispose",De),ht(U)}function ht(E){Et(E),xe.remove(E)}function Et(E){const U=xe.get(E).programs;U!==void 0&&(U.forEach(function(k){ye.releaseProgram(k)}),E.isShaderMaterial&&ye.releaseShaderCache(E))}this.renderBufferDirect=function(E,U,k,H,B,J){U===null&&(U=ct);const re=B.isMesh&&B.matrixWorld.determinant()<0,ue=wc(E,U,k,H,B);be.setMaterial(H,re);let ge=k.index,Ce=1;if(H.wireframe===!0){if(ge=Q.getWireframeAttribute(k),ge===void 0)return;Ce=2}const Ie=k.drawRange,Se=k.attributes.position;let qe=Ie.start*Ce,je=(Ie.start+Ie.count)*Ce;J!==null&&(qe=Math.max(qe,J.start*Ce),je=Math.min(je,(J.start+J.count)*Ce)),ge!==null?(qe=Math.max(qe,0),je=Math.min(je,ge.count)):Se!=null&&(qe=Math.max(qe,0),je=Math.min(je,Se.count));const mt=je-qe;if(mt<0||mt===1/0)return;st.setup(B,H,ue,k,ge);let ut,$e=me;if(ge!==null&&(ut=Z.get(ge),$e=Ge,$e.setIndex(ut)),B.isMesh)H.wireframe===!0?(be.setLineWidth(H.wireframeLinewidth*pt()),$e.setMode(D.LINES)):$e.setMode(D.TRIANGLES);else if(B.isLine){let Me=H.linewidth;Me===void 0&&(Me=1),be.setLineWidth(Me*pt()),B.isLineSegments?$e.setMode(D.LINES):B.isLineLoop?$e.setMode(D.LINE_LOOP):$e.setMode(D.LINE_STRIP)}else B.isPoints?$e.setMode(D.POINTS):B.isSprite&&$e.setMode(D.TRIANGLES);if(B.isBatchedMesh)if(B._multiDrawInstances!==null)$e.renderMultiDrawInstances(B._multiDrawStarts,B._multiDrawCounts,B._multiDrawCount,B._multiDrawInstances);else if(He.get("WEBGL_multi_draw"))$e.renderMultiDraw(B._multiDrawStarts,B._multiDrawCounts,B._multiDrawCount);else{const Me=B._multiDrawStarts,St=B._multiDrawCounts,Qe=B._multiDrawCount,jt=ge?Z.get(ge).bytesPerElement:1,Ji=xe.get(H).currentProgram.getUniforms();for(let Bt=0;Bt<Qe;Bt++)Ji.setValue(D,"_gl_DrawID",Bt),$e.render(Me[Bt]/jt,St[Bt])}else if(B.isInstancedMesh)$e.renderInstances(qe,mt,B.count);else if(k.isInstancedBufferGeometry){const Me=k._maxInstanceCount!==void 0?k._maxInstanceCount:1/0,St=Math.min(k.instanceCount,Me);$e.renderInstances(qe,mt,St)}else $e.render(qe,mt)};function Je(E,U,k){E.transparent===!0&&E.side===Ct&&E.forceSinglePass===!1?(E.side=Ut,E.needsUpdate=!0,cs(E,U,k),E.side=Li,E.needsUpdate=!0,cs(E,U,k),E.side=Ct):cs(E,U,k)}this.compile=function(E,U,k=null){k===null&&(k=E),u=Xe.get(k),u.init(U),_.push(u),k.traverseVisible(function(B){B.isLight&&B.layers.test(U.layers)&&(u.pushLight(B),B.castShadow&&u.pushShadow(B))}),E!==k&&E.traverseVisible(function(B){B.isLight&&B.layers.test(U.layers)&&(u.pushLight(B),B.castShadow&&u.pushShadow(B))}),u.setupLights();const H=new Set;return E.traverse(function(B){if(!(B.isMesh||B.isPoints||B.isLine||B.isSprite))return;const J=B.material;if(J)if(Array.isArray(J))for(let re=0;re<J.length;re++){const ue=J[re];Je(ue,k,B),H.add(ue)}else Je(J,k,B),H.add(J)}),_.pop(),u=null,H},this.compileAsync=function(E,U,k=null){const H=this.compile(E,U,k);return new Promise(B=>{function J(){if(H.forEach(function(re){xe.get(re).currentProgram.isReady()&&H.delete(re)}),H.size===0){B(E);return}setTimeout(J,10)}He.get("KHR_parallel_shader_compile")!==null?J():setTimeout(J,10)})};let Kt=null;function oi(E){Kt&&Kt(E)}function to(){Fi.stop()}function io(){Fi.start()}const Fi=new pc;Fi.setAnimationLoop(oi),typeof self<"u"&&Fi.setContext(self),this.setAnimationLoop=function(E){Kt=E,V.setAnimationLoop(E),E===null?Fi.stop():Fi.start()},V.addEventListener("sessionstart",to),V.addEventListener("sessionend",io),this.render=function(E,U){if(U!==void 0&&U.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(T===!0)return;if(E.matrixWorldAutoUpdate===!0&&E.updateMatrixWorld(),U.parent===null&&U.matrixWorldAutoUpdate===!0&&U.updateMatrixWorld(),V.enabled===!0&&V.isPresenting===!0&&(V.cameraAutoUpdate===!0&&V.updateCamera(U),U=V.getCamera()),E.isScene===!0&&E.onBeforeRender(x,E,U,P),u=Xe.get(E,_.length),u.init(U),_.push(u),we.multiplyMatrices(U.projectionMatrix,U.matrixWorldInverse),Y.setFromProjectionMatrix(we),ve=this.localClippingEnabled,ie=te.init(this.clippingPlanes,ve),m=fe.get(E,v.length),m.init(),v.push(m),V.enabled===!0&&V.isPresenting===!0){const J=x.xr.getDepthSensingMesh();J!==null&&lr(J,U,-1/0,x.sortObjects)}lr(E,U,0,x.sortObjects),m.finish(),x.sortObjects===!0&&m.sort(ae,de),We=V.enabled===!1||V.isPresenting===!1||V.hasDepthSensing()===!1,We&&Ee.addToRenderList(m,E),this.info.render.frame++,ie===!0&&te.beginShadows();const k=u.state.shadowsArray;pe.render(k,E,U),ie===!0&&te.endShadows(),this.info.autoReset===!0&&this.info.reset();const H=m.opaque,B=m.transmissive;if(u.setupLights(),U.isArrayCamera){const J=U.cameras;if(B.length>0)for(let re=0,ue=J.length;re<ue;re++){const ge=J[re];so(H,B,E,ge)}We&&Ee.render(E);for(let re=0,ue=J.length;re<ue;re++){const ge=J[re];no(m,E,ge,ge.viewport)}}else B.length>0&&so(H,B,E,U),We&&Ee.render(E),no(m,E,U);P!==null&&A===0&&(R.updateMultisampleRenderTarget(P),R.updateRenderTargetMipmap(P)),E.isScene===!0&&E.onAfterRender(x,E,U),st.resetDefaultState(),M=-1,S=null,_.pop(),_.length>0?(u=_[_.length-1],ie===!0&&te.setGlobalState(x.clippingPlanes,u.state.camera)):u=null,v.pop(),v.length>0?m=v[v.length-1]:m=null};function lr(E,U,k,H){if(E.visible===!1)return;if(E.layers.test(U.layers)){if(E.isGroup)k=E.renderOrder;else if(E.isLOD)E.autoUpdate===!0&&E.update(U);else if(E.isLight)u.pushLight(E),E.castShadow&&u.pushShadow(E);else if(E.isSprite){if(!E.frustumCulled||Y.intersectsSprite(E)){H&&Oe.setFromMatrixPosition(E.matrixWorld).applyMatrix4(we);const re=q.update(E),ue=E.material;ue.visible&&m.push(E,re,ue,k,Oe.z,null)}}else if((E.isMesh||E.isLine||E.isPoints)&&(!E.frustumCulled||Y.intersectsObject(E))){const re=q.update(E),ue=E.material;if(H&&(E.boundingSphere!==void 0?(E.boundingSphere===null&&E.computeBoundingSphere(),Oe.copy(E.boundingSphere.center)):(re.boundingSphere===null&&re.computeBoundingSphere(),Oe.copy(re.boundingSphere.center)),Oe.applyMatrix4(E.matrixWorld).applyMatrix4(we)),Array.isArray(ue)){const ge=re.groups;for(let Ce=0,Ie=ge.length;Ce<Ie;Ce++){const Se=ge[Ce],qe=ue[Se.materialIndex];qe&&qe.visible&&m.push(E,re,qe,k,Oe.z,Se)}}else ue.visible&&m.push(E,re,ue,k,Oe.z,null)}}const J=E.children;for(let re=0,ue=J.length;re<ue;re++)lr(J[re],U,k,H)}function no(E,U,k,H){const B=E.opaque,J=E.transmissive,re=E.transparent;u.setupLightsView(k),ie===!0&&te.setGlobalState(x.clippingPlanes,k),H&&be.viewport(I.copy(H)),B.length>0&&ls(B,U,k),J.length>0&&ls(J,U,k),re.length>0&&ls(re,U,k),be.buffers.depth.setTest(!0),be.buffers.depth.setMask(!0),be.buffers.color.setMask(!0),be.setPolygonOffset(!1)}function so(E,U,k,H){if((k.isScene===!0?k.overrideMaterial:null)!==null)return;u.state.transmissionRenderTarget[H.id]===void 0&&(u.state.transmissionRenderTarget[H.id]=new Ki(1,1,{generateMipmaps:!0,type:He.has("EXT_color_buffer_half_float")||He.has("EXT_color_buffer_float")?as:_i,minFilter:Pi,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Ye.workingColorSpace}));const J=u.state.transmissionRenderTarget[H.id],re=H.viewport||I;J.setSize(re.z*x.transmissionResolutionScale,re.w*x.transmissionResolutionScale);const ue=x.getRenderTarget();x.setRenderTarget(J),x.getClearColor(W),$=x.getClearAlpha(),$<1&&x.setClearColor(16777215,.5),x.clear(),We&&Ee.render(k);const ge=x.toneMapping;x.toneMapping=Di;const Ce=H.viewport;if(H.viewport!==void 0&&(H.viewport=void 0),u.setupLightsView(H),ie===!0&&te.setGlobalState(x.clippingPlanes,H),ls(E,k,H),R.updateMultisampleRenderTarget(J),R.updateRenderTargetMipmap(J),He.has("WEBGL_multisampled_render_to_texture")===!1){let Ie=!1;for(let Se=0,qe=U.length;Se<qe;Se++){const je=U[Se],mt=je.object,ut=je.geometry,$e=je.material,Me=je.group;if($e.side===Ct&&mt.layers.test(H.layers)){const St=$e.side;$e.side=Ut,$e.needsUpdate=!0,ro(mt,k,H,ut,$e,Me),$e.side=St,$e.needsUpdate=!0,Ie=!0}}Ie===!0&&(R.updateMultisampleRenderTarget(J),R.updateRenderTargetMipmap(J))}x.setRenderTarget(ue),x.setClearColor(W,$),Ce!==void 0&&(H.viewport=Ce),x.toneMapping=ge}function ls(E,U,k){const H=U.isScene===!0?U.overrideMaterial:null;for(let B=0,J=E.length;B<J;B++){const re=E[B],ue=re.object,ge=re.geometry,Ce=H===null?re.material:H,Ie=re.group;ue.layers.test(k.layers)&&ro(ue,U,k,ge,Ce,Ie)}}function ro(E,U,k,H,B,J){E.onBeforeRender(x,U,k,H,B,J),E.modelViewMatrix.multiplyMatrices(k.matrixWorldInverse,E.matrixWorld),E.normalMatrix.getNormalMatrix(E.modelViewMatrix),B.onBeforeRender(x,U,k,H,E,J),B.transparent===!0&&B.side===Ct&&B.forceSinglePass===!1?(B.side=Ut,B.needsUpdate=!0,x.renderBufferDirect(k,U,H,B,E,J),B.side=Li,B.needsUpdate=!0,x.renderBufferDirect(k,U,H,B,E,J),B.side=Ct):x.renderBufferDirect(k,U,H,B,E,J),E.onAfterRender(x,U,k,H,B,J)}function cs(E,U,k){U.isScene!==!0&&(U=ct);const H=xe.get(E),B=u.state.lights,J=u.state.shadowsArray,re=B.state.version,ue=ye.getParameters(E,B.state,J,U,k),ge=ye.getProgramCacheKey(ue);let Ce=H.programs;H.environment=E.isMeshStandardMaterial?U.environment:null,H.fog=U.fog,H.envMap=(E.isMeshStandardMaterial?z:b).get(E.envMap||H.environment),H.envMapRotation=H.environment!==null&&E.envMap===null?U.environmentRotation:E.envMapRotation,Ce===void 0&&(E.addEventListener("dispose",De),Ce=new Map,H.programs=Ce);let Ie=Ce.get(ge);if(Ie!==void 0){if(H.currentProgram===Ie&&H.lightsStateVersion===re)return oo(E,ue),Ie}else ue.uniforms=ye.getUniforms(E),E.onBeforeCompile(ue,x),Ie=ye.acquireProgram(ue,ge),Ce.set(ge,Ie),H.uniforms=ue.uniforms;const Se=H.uniforms;return(!E.isShaderMaterial&&!E.isRawShaderMaterial||E.clipping===!0)&&(Se.clippingPlanes=te.uniform),oo(E,ue),H.needsLights=Rc(E),H.lightsStateVersion=re,H.needsLights&&(Se.ambientLightColor.value=B.state.ambient,Se.lightProbe.value=B.state.probe,Se.directionalLights.value=B.state.directional,Se.directionalLightShadows.value=B.state.directionalShadow,Se.spotLights.value=B.state.spot,Se.spotLightShadows.value=B.state.spotShadow,Se.rectAreaLights.value=B.state.rectArea,Se.ltc_1.value=B.state.rectAreaLTC1,Se.ltc_2.value=B.state.rectAreaLTC2,Se.pointLights.value=B.state.point,Se.pointLightShadows.value=B.state.pointShadow,Se.hemisphereLights.value=B.state.hemi,Se.directionalShadowMap.value=B.state.directionalShadowMap,Se.directionalShadowMatrix.value=B.state.directionalShadowMatrix,Se.spotShadowMap.value=B.state.spotShadowMap,Se.spotLightMatrix.value=B.state.spotLightMatrix,Se.spotLightMap.value=B.state.spotLightMap,Se.pointShadowMap.value=B.state.pointShadowMap,Se.pointShadowMatrix.value=B.state.pointShadowMatrix),H.currentProgram=Ie,H.uniformsList=null,Ie}function ao(E){if(E.uniformsList===null){const U=E.currentProgram.getUniforms();E.uniformsList=Ys.seqWithValue(U.seq,E.uniforms)}return E.uniformsList}function oo(E,U){const k=xe.get(E);k.outputColorSpace=U.outputColorSpace,k.batching=U.batching,k.batchingColor=U.batchingColor,k.instancing=U.instancing,k.instancingColor=U.instancingColor,k.instancingMorph=U.instancingMorph,k.skinning=U.skinning,k.morphTargets=U.morphTargets,k.morphNormals=U.morphNormals,k.morphColors=U.morphColors,k.morphTargetsCount=U.morphTargetsCount,k.numClippingPlanes=U.numClippingPlanes,k.numIntersection=U.numClipIntersection,k.vertexAlphas=U.vertexAlphas,k.vertexTangents=U.vertexTangents,k.toneMapping=U.toneMapping}function wc(E,U,k,H,B){U.isScene!==!0&&(U=ct),R.resetTextureUnits();const J=U.fog,re=H.isMeshStandardMaterial?U.environment:null,ue=P===null?x.outputColorSpace:P.isXRRenderTarget===!0?P.texture.colorSpace:Dn,ge=(H.isMeshStandardMaterial?z:b).get(H.envMap||re),Ce=H.vertexColors===!0&&!!k.attributes.color&&k.attributes.color.itemSize===4,Ie=!!k.attributes.tangent&&(!!H.normalMap||H.anisotropy>0),Se=!!k.morphAttributes.position,qe=!!k.morphAttributes.normal,je=!!k.morphAttributes.color;let mt=Di;H.toneMapped&&(P===null||P.isXRRenderTarget===!0)&&(mt=x.toneMapping);const ut=k.morphAttributes.position||k.morphAttributes.normal||k.morphAttributes.color,$e=ut!==void 0?ut.length:0,Me=xe.get(H),St=u.state.lights;if(ie===!0&&(ve===!0||E!==S)){const At=E===S&&H.id===M;te.setState(H,E,At)}let Qe=!1;H.version===Me.__version?(Me.needsLights&&Me.lightsStateVersion!==St.state.version||Me.outputColorSpace!==ue||B.isBatchedMesh&&Me.batching===!1||!B.isBatchedMesh&&Me.batching===!0||B.isBatchedMesh&&Me.batchingColor===!0&&B.colorTexture===null||B.isBatchedMesh&&Me.batchingColor===!1&&B.colorTexture!==null||B.isInstancedMesh&&Me.instancing===!1||!B.isInstancedMesh&&Me.instancing===!0||B.isSkinnedMesh&&Me.skinning===!1||!B.isSkinnedMesh&&Me.skinning===!0||B.isInstancedMesh&&Me.instancingColor===!0&&B.instanceColor===null||B.isInstancedMesh&&Me.instancingColor===!1&&B.instanceColor!==null||B.isInstancedMesh&&Me.instancingMorph===!0&&B.morphTexture===null||B.isInstancedMesh&&Me.instancingMorph===!1&&B.morphTexture!==null||Me.envMap!==ge||H.fog===!0&&Me.fog!==J||Me.numClippingPlanes!==void 0&&(Me.numClippingPlanes!==te.numPlanes||Me.numIntersection!==te.numIntersection)||Me.vertexAlphas!==Ce||Me.vertexTangents!==Ie||Me.morphTargets!==Se||Me.morphNormals!==qe||Me.morphColors!==je||Me.toneMapping!==mt||Me.morphTargetsCount!==$e)&&(Qe=!0):(Qe=!0,Me.__version=H.version);let jt=Me.currentProgram;Qe===!0&&(jt=cs(H,U,B));let Ji=!1,Bt=!1,Nn=!1;const ot=jt.getUniforms(),Wt=Me.uniforms;if(be.useProgram(jt.program)&&(Ji=!0,Bt=!0,Nn=!0),H.id!==M&&(M=H.id,Bt=!0),Ji||S!==E){be.buffers.depth.getReversed()?(oe.copy(E.projectionMatrix),Uh(oe),Bh(oe),ot.setValue(D,"projectionMatrix",oe)):ot.setValue(D,"projectionMatrix",E.projectionMatrix),ot.setValue(D,"viewMatrix",E.matrixWorldInverse);const Lt=ot.map.cameraPosition;Lt!==void 0&&Lt.setValue(D,Pe.setFromMatrixPosition(E.matrixWorld)),Ve.logarithmicDepthBuffer&&ot.setValue(D,"logDepthBufFC",2/(Math.log(E.far+1)/Math.LN2)),(H.isMeshPhongMaterial||H.isMeshToonMaterial||H.isMeshLambertMaterial||H.isMeshBasicMaterial||H.isMeshStandardMaterial||H.isShaderMaterial)&&ot.setValue(D,"isOrthographic",E.isOrthographicCamera===!0),S!==E&&(S=E,Bt=!0,Nn=!0)}if(B.isSkinnedMesh){ot.setOptional(D,B,"bindMatrix"),ot.setOptional(D,B,"bindMatrixInverse");const At=B.skeleton;At&&(At.boneTexture===null&&At.computeBoneTexture(),ot.setValue(D,"boneTexture",At.boneTexture,R))}B.isBatchedMesh&&(ot.setOptional(D,B,"batchingTexture"),ot.setValue(D,"batchingTexture",B._matricesTexture,R),ot.setOptional(D,B,"batchingIdTexture"),ot.setValue(D,"batchingIdTexture",B._indirectTexture,R),ot.setOptional(D,B,"batchingColorTexture"),B._colorsTexture!==null&&ot.setValue(D,"batchingColorTexture",B._colorsTexture,R));const Xt=k.morphAttributes;if((Xt.position!==void 0||Xt.normal!==void 0||Xt.color!==void 0)&&Re.update(B,k,jt),(Bt||Me.receiveShadow!==B.receiveShadow)&&(Me.receiveShadow=B.receiveShadow,ot.setValue(D,"receiveShadow",B.receiveShadow)),H.isMeshGouraudMaterial&&H.envMap!==null&&(Wt.envMap.value=ge,Wt.flipEnvMap.value=ge.isCubeTexture&&ge.isRenderTargetTexture===!1?-1:1),H.isMeshStandardMaterial&&H.envMap===null&&U.environment!==null&&(Wt.envMapIntensity.value=U.environmentIntensity),Bt&&(ot.setValue(D,"toneMappingExposure",x.toneMappingExposure),Me.needsLights&&Tc(Wt,Nn),J&&H.fog===!0&&le.refreshFogUniforms(Wt,J),le.refreshMaterialUniforms(Wt,H,G,j,u.state.transmissionRenderTarget[E.id]),Ys.upload(D,ao(Me),Wt,R)),H.isShaderMaterial&&H.uniformsNeedUpdate===!0&&(Ys.upload(D,ao(Me),Wt,R),H.uniformsNeedUpdate=!1),H.isSpriteMaterial&&ot.setValue(D,"center",B.center),ot.setValue(D,"modelViewMatrix",B.modelViewMatrix),ot.setValue(D,"normalMatrix",B.normalMatrix),ot.setValue(D,"modelMatrix",B.matrixWorld),H.isShaderMaterial||H.isRawShaderMaterial){const At=H.uniformsGroups;for(let Lt=0,cr=At.length;Lt<cr;Lt++){const Ui=At[Lt];L.update(Ui,jt),L.bind(Ui,jt)}}return jt}function Tc(E,U){E.ambientLightColor.needsUpdate=U,E.lightProbe.needsUpdate=U,E.directionalLights.needsUpdate=U,E.directionalLightShadows.needsUpdate=U,E.pointLights.needsUpdate=U,E.pointLightShadows.needsUpdate=U,E.spotLights.needsUpdate=U,E.spotLightShadows.needsUpdate=U,E.rectAreaLights.needsUpdate=U,E.hemisphereLights.needsUpdate=U}function Rc(E){return E.isMeshLambertMaterial||E.isMeshToonMaterial||E.isMeshPhongMaterial||E.isMeshStandardMaterial||E.isShadowMaterial||E.isShaderMaterial&&E.lights===!0}this.getActiveCubeFace=function(){return C},this.getActiveMipmapLevel=function(){return A},this.getRenderTarget=function(){return P},this.setRenderTargetTextures=function(E,U,k){xe.get(E.texture).__webglTexture=U,xe.get(E.depthTexture).__webglTexture=k;const H=xe.get(E);H.__hasExternalTextures=!0,H.__autoAllocateDepthBuffer=k===void 0,H.__autoAllocateDepthBuffer||He.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),H.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(E,U){const k=xe.get(E);k.__webglFramebuffer=U,k.__useDefaultFramebuffer=U===void 0};const Cc=D.createFramebuffer();this.setRenderTarget=function(E,U=0,k=0){P=E,C=U,A=k;let H=!0,B=null,J=!1,re=!1;if(E){const ge=xe.get(E);if(ge.__useDefaultFramebuffer!==void 0)be.bindFramebuffer(D.FRAMEBUFFER,null),H=!1;else if(ge.__webglFramebuffer===void 0)R.setupRenderTarget(E);else if(ge.__hasExternalTextures)R.rebindTextures(E,xe.get(E.texture).__webglTexture,xe.get(E.depthTexture).__webglTexture);else if(E.depthBuffer){const Se=E.depthTexture;if(ge.__boundDepthTexture!==Se){if(Se!==null&&xe.has(Se)&&(E.width!==Se.image.width||E.height!==Se.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");R.setupDepthRenderbuffer(E)}}const Ce=E.texture;(Ce.isData3DTexture||Ce.isDataArrayTexture||Ce.isCompressedArrayTexture)&&(re=!0);const Ie=xe.get(E).__webglFramebuffer;E.isWebGLCubeRenderTarget?(Array.isArray(Ie[U])?B=Ie[U][k]:B=Ie[U],J=!0):E.samples>0&&R.useMultisampledRTT(E)===!1?B=xe.get(E).__webglMultisampledFramebuffer:Array.isArray(Ie)?B=Ie[k]:B=Ie,I.copy(E.viewport),F.copy(E.scissor),N=E.scissorTest}else I.copy(_e).multiplyScalar(G).floor(),F.copy(Ne).multiplyScalar(G).floor(),N=nt;if(k!==0&&(B=Cc),be.bindFramebuffer(D.FRAMEBUFFER,B)&&H&&be.drawBuffers(E,B),be.viewport(I),be.scissor(F),be.setScissorTest(N),J){const ge=xe.get(E.texture);D.framebufferTexture2D(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_CUBE_MAP_POSITIVE_X+U,ge.__webglTexture,k)}else if(re){const ge=xe.get(E.texture),Ce=U;D.framebufferTextureLayer(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,ge.__webglTexture,k,Ce)}else if(E!==null&&k!==0){const ge=xe.get(E.texture);D.framebufferTexture2D(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,ge.__webglTexture,k)}M=-1},this.readRenderTargetPixels=function(E,U,k,H,B,J,re){if(!(E&&E.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let ue=xe.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&re!==void 0&&(ue=ue[re]),ue){be.bindFramebuffer(D.FRAMEBUFFER,ue);try{const ge=E.texture,Ce=ge.format,Ie=ge.type;if(!Ve.textureFormatReadable(Ce)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Ve.textureTypeReadable(Ie)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}U>=0&&U<=E.width-H&&k>=0&&k<=E.height-B&&D.readPixels(U,k,H,B,Ue.convert(Ce),Ue.convert(Ie),J)}finally{const ge=P!==null?xe.get(P).__webglFramebuffer:null;be.bindFramebuffer(D.FRAMEBUFFER,ge)}}},this.readRenderTargetPixelsAsync=async function(E,U,k,H,B,J,re){if(!(E&&E.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let ue=xe.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&re!==void 0&&(ue=ue[re]),ue){const ge=E.texture,Ce=ge.format,Ie=ge.type;if(!Ve.textureFormatReadable(Ce))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Ve.textureTypeReadable(Ie))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(U>=0&&U<=E.width-H&&k>=0&&k<=E.height-B){be.bindFramebuffer(D.FRAMEBUFFER,ue);const Se=D.createBuffer();D.bindBuffer(D.PIXEL_PACK_BUFFER,Se),D.bufferData(D.PIXEL_PACK_BUFFER,J.byteLength,D.STREAM_READ),D.readPixels(U,k,H,B,Ue.convert(Ce),Ue.convert(Ie),0);const qe=P!==null?xe.get(P).__webglFramebuffer:null;be.bindFramebuffer(D.FRAMEBUFFER,qe);const je=D.fenceSync(D.SYNC_GPU_COMMANDS_COMPLETE,0);return D.flush(),await Fh(D,je,4),D.bindBuffer(D.PIXEL_PACK_BUFFER,Se),D.getBufferSubData(D.PIXEL_PACK_BUFFER,0,J),D.deleteBuffer(Se),D.deleteSync(je),J}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(E,U=null,k=0){E.isTexture!==!0&&(bn("WebGLRenderer: copyFramebufferToTexture function signature has changed."),U=arguments[0]||null,E=arguments[1]);const H=Math.pow(2,-k),B=Math.floor(E.image.width*H),J=Math.floor(E.image.height*H),re=U!==null?U.x:0,ue=U!==null?U.y:0;R.setTexture2D(E,0),D.copyTexSubImage2D(D.TEXTURE_2D,k,0,0,re,ue,B,J),be.unbindTexture()};const Ac=D.createFramebuffer(),Pc=D.createFramebuffer();this.copyTextureToTexture=function(E,U,k=null,H=null,B=0,J=null){E.isTexture!==!0&&(bn("WebGLRenderer: copyTextureToTexture function signature has changed."),H=arguments[0]||null,E=arguments[1],U=arguments[2],J=arguments[3]||0,k=null),J===null&&(B!==0?(bn("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),J=B,B=0):J=0);let re,ue,ge,Ce,Ie,Se,qe,je,mt;const ut=E.isCompressedTexture?E.mipmaps[J]:E.image;if(k!==null)re=k.max.x-k.min.x,ue=k.max.y-k.min.y,ge=k.isBox3?k.max.z-k.min.z:1,Ce=k.min.x,Ie=k.min.y,Se=k.isBox3?k.min.z:0;else{const Xt=Math.pow(2,-B);re=Math.floor(ut.width*Xt),ue=Math.floor(ut.height*Xt),E.isDataArrayTexture?ge=ut.depth:E.isData3DTexture?ge=Math.floor(ut.depth*Xt):ge=1,Ce=0,Ie=0,Se=0}H!==null?(qe=H.x,je=H.y,mt=H.z):(qe=0,je=0,mt=0);const $e=Ue.convert(U.format),Me=Ue.convert(U.type);let St;U.isData3DTexture?(R.setTexture3D(U,0),St=D.TEXTURE_3D):U.isDataArrayTexture||U.isCompressedArrayTexture?(R.setTexture2DArray(U,0),St=D.TEXTURE_2D_ARRAY):(R.setTexture2D(U,0),St=D.TEXTURE_2D),D.pixelStorei(D.UNPACK_FLIP_Y_WEBGL,U.flipY),D.pixelStorei(D.UNPACK_PREMULTIPLY_ALPHA_WEBGL,U.premultiplyAlpha),D.pixelStorei(D.UNPACK_ALIGNMENT,U.unpackAlignment);const Qe=D.getParameter(D.UNPACK_ROW_LENGTH),jt=D.getParameter(D.UNPACK_IMAGE_HEIGHT),Ji=D.getParameter(D.UNPACK_SKIP_PIXELS),Bt=D.getParameter(D.UNPACK_SKIP_ROWS),Nn=D.getParameter(D.UNPACK_SKIP_IMAGES);D.pixelStorei(D.UNPACK_ROW_LENGTH,ut.width),D.pixelStorei(D.UNPACK_IMAGE_HEIGHT,ut.height),D.pixelStorei(D.UNPACK_SKIP_PIXELS,Ce),D.pixelStorei(D.UNPACK_SKIP_ROWS,Ie),D.pixelStorei(D.UNPACK_SKIP_IMAGES,Se);const ot=E.isDataArrayTexture||E.isData3DTexture,Wt=U.isDataArrayTexture||U.isData3DTexture;if(E.isDepthTexture){const Xt=xe.get(E),At=xe.get(U),Lt=xe.get(Xt.__renderTarget),cr=xe.get(At.__renderTarget);be.bindFramebuffer(D.READ_FRAMEBUFFER,Lt.__webglFramebuffer),be.bindFramebuffer(D.DRAW_FRAMEBUFFER,cr.__webglFramebuffer);for(let Ui=0;Ui<ge;Ui++)ot&&(D.framebufferTextureLayer(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,xe.get(E).__webglTexture,B,Se+Ui),D.framebufferTextureLayer(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,xe.get(U).__webglTexture,J,mt+Ui)),D.blitFramebuffer(Ce,Ie,re,ue,qe,je,re,ue,D.DEPTH_BUFFER_BIT,D.NEAREST);be.bindFramebuffer(D.READ_FRAMEBUFFER,null),be.bindFramebuffer(D.DRAW_FRAMEBUFFER,null)}else if(B!==0||E.isRenderTargetTexture||xe.has(E)){const Xt=xe.get(E),At=xe.get(U);be.bindFramebuffer(D.READ_FRAMEBUFFER,Ac),be.bindFramebuffer(D.DRAW_FRAMEBUFFER,Pc);for(let Lt=0;Lt<ge;Lt++)ot?D.framebufferTextureLayer(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,Xt.__webglTexture,B,Se+Lt):D.framebufferTexture2D(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,Xt.__webglTexture,B),Wt?D.framebufferTextureLayer(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,At.__webglTexture,J,mt+Lt):D.framebufferTexture2D(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,At.__webglTexture,J),B!==0?D.blitFramebuffer(Ce,Ie,re,ue,qe,je,re,ue,D.COLOR_BUFFER_BIT,D.NEAREST):Wt?D.copyTexSubImage3D(St,J,qe,je,mt+Lt,Ce,Ie,re,ue):D.copyTexSubImage2D(St,J,qe,je,Ce,Ie,re,ue);be.bindFramebuffer(D.READ_FRAMEBUFFER,null),be.bindFramebuffer(D.DRAW_FRAMEBUFFER,null)}else Wt?E.isDataTexture||E.isData3DTexture?D.texSubImage3D(St,J,qe,je,mt,re,ue,ge,$e,Me,ut.data):U.isCompressedArrayTexture?D.compressedTexSubImage3D(St,J,qe,je,mt,re,ue,ge,$e,ut.data):D.texSubImage3D(St,J,qe,je,mt,re,ue,ge,$e,Me,ut):E.isDataTexture?D.texSubImage2D(D.TEXTURE_2D,J,qe,je,re,ue,$e,Me,ut.data):E.isCompressedTexture?D.compressedTexSubImage2D(D.TEXTURE_2D,J,qe,je,ut.width,ut.height,$e,ut.data):D.texSubImage2D(D.TEXTURE_2D,J,qe,je,re,ue,$e,Me,ut);D.pixelStorei(D.UNPACK_ROW_LENGTH,Qe),D.pixelStorei(D.UNPACK_IMAGE_HEIGHT,jt),D.pixelStorei(D.UNPACK_SKIP_PIXELS,Ji),D.pixelStorei(D.UNPACK_SKIP_ROWS,Bt),D.pixelStorei(D.UNPACK_SKIP_IMAGES,Nn),J===0&&U.generateMipmaps&&D.generateMipmap(St),be.unbindTexture()},this.copyTextureToTexture3D=function(E,U,k=null,H=null,B=0){return E.isTexture!==!0&&(bn("WebGLRenderer: copyTextureToTexture3D function signature has changed."),k=arguments[0]||null,H=arguments[1]||null,E=arguments[2],U=arguments[3],B=arguments[4]||0),bn('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(E,U,k,H,B)},this.initRenderTarget=function(E){xe.get(E).__webglFramebuffer===void 0&&R.setupRenderTarget(E)},this.initTexture=function(E){E.isCubeTexture?R.setTextureCube(E,0):E.isData3DTexture?R.setTexture3D(E,0):E.isDataArrayTexture||E.isCompressedArrayTexture?R.setTexture2DArray(E,0):R.setTexture2D(E,0),be.unbindTexture()},this.resetState=function(){C=0,A=0,P=null,be.reset(),st.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return mi}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorspace=Ye._getDrawingBufferColorSpace(e),t.unpackColorSpace=Ye._getUnpackColorSpace()}}const Ua=66743e-15,Ze=149597870700,eo=198840987e22,xc=5972167867e15,hg=73458e18,ug=6957e5,_c=6378100,dg=1737400,Zs=3828e23,wl={w:384,h:192},Tl={w:256,h:128},Rl={w:128,h:64},Cl=20,Al=50,Pl=100,Xr=1.1,fg=2,pg=1,mg=200,gg=20,vg=128,yg=64,O={accent:{primary:"#18e7ec",primaryMuted:"rgba(24, 231, 236, 0.6)",secondary:"#55CCCC"},surface:{panelBg:"rgba(33, 39, 49, 0.78)",headerBg:"rgba(57, 62, 70, 0.35)",inputBg:"rgba(57, 62, 70, 0.5)",buttonBg:"rgba(57, 62, 70, 0.35)",buttonHoverBg:"rgba(57, 62, 70, 0.65)",cardBorder:"rgba(237, 237, 237, 0.16)",cardBorderSubtle:"rgba(237, 237, 237, 0.08)",inputBorder:"rgba(237, 237, 237, 0.2)",panelShadow:"0 12px 32px 0 rgba(0, 0, 0, 0.45), inset 0 1px 0 0 rgba(255, 255, 255, 0.15)"},text:{primary:"#ededed",highContrast:"#ffffff",secondary:"rgba(237, 237, 237, 0.85)",muted:"rgba(237, 237, 237, 0.7)",subtle:"rgba(237, 237, 237, 0.6)",disabled:"rgba(237, 237, 237, 0.5)",hint:"rgba(237, 237, 237, 0.4)"},status:{good:"#4caf50",excellent:"#8bc34a",paused:"#ff9800",critical:"#f44336",error:"#ff5252",dangerBg:"rgba(255, 0, 0, 0.1)",dangerBorder:"rgba(255, 107, 107, 0.6)",dangerText:"#ffe6e6"},touch:{btnGradientStart:"rgba(33, 39, 49, 0.9)",btnGradientEnd:"rgba(57, 62, 70, 0.9)",btnGradientActiveStart:"rgba(57, 62, 70, 0.95)",btnGradientActiveEnd:"rgba(85, 204, 204, 0.8)",btnGradientHoverStart:"rgba(40, 48, 60, 0.9)",btnGradientHoverEnd:"rgba(65, 72, 82, 0.9)",btnBorder:"rgba(24, 231, 236, 0.35)",btnShadow:"rgba(0, 0, 0, 0.4)"}},fi=[{sim:1,label:"1s/s"},{sim:10,label:"10s/s"},{sim:60,label:"1min/s"},{sim:600,label:"10min/s"},{sim:1800,label:"30min/s"},{sim:3600,label:"1hr/s"},{sim:21600,label:"6hr/s"},{sim:43200,label:"12hr/s"},{sim:86400,label:"1day/s"},{sim:259200,label:"3day/s"},{sim:604800,label:"1wk/s"},{sim:1209600,label:"2wk/s"},{sim:2592e3,label:"1mo/s"},{sim:7776e3,label:"3mo/s"},{sim:15552e3,label:"6mo/s"},{sim:31536e3,label:"1yr/s"}],xg=200,bc=500,Il=Math.PI*2;function Dl(s,e){if(!Number.isFinite(s)||!Number.isFinite(e))return e;let t=e;for(;t-s>Math.PI;)t-=Il;for(;t-s<-Math.PI;)t+=Il;return t}function _g(s){return!Number.isFinite(s)||s<0?1:s+1}function Vi(s,e,t){return Number.isFinite(s)?Math.max(e,Math.min(t,s)):e}function bg(s,e){if(!Number.isFinite(s)||!Number.isFinite(e)||e<=0)return 1;const t=Math.max(0,Math.min(.9999,s));return 1-Math.pow(t,e*60)}const Sg=9461e12,Mg=3086e13,nr={solar:{maxRadius:1e15,far:1e15},interstellar:{maxRadius:10*Sg,far:15e16},galactic:{maxRadius:1e3*Mg,far:1e20}};class Eg extends kt{radius=3*Ze;azimuth=0;elevation=Math.PI/6;roll=0;focusX=0;focusY=0;focusZ=0;freeMode=!1;freeX=0;freeY=0;freeZ=0;freeOriginX=0;freeOriginY=0;freeOriginZ=0;surfaceMode=!1;surfaceX=0;surfaceY=0;surfaceZ=0;surfaceCenterX=0;surfaceCenterY=0;surfaceCenterZ=0;surfaceBodyRadius=1;surfaceEyeHeight=1.7;surfaceYaw=0;surfacePitch=0;surfaceYawVelocity=0;surfacePitchVelocity=0;surfaceRotationAxis=new w(0,1,0);surfaceRotationRate=0;surfaceLookSensitivity=.3;surfaceRotationDamping=0;surfacePitchLimit=Math.PI/2-.01;canvas;pointerLocked=!1;ignoredButtons=new Set;freeLookSensitivity=.3;originX=0;originY=0;originZ=0;isDragging=!1;lastMouseX=0;lastMouseY=0;isRightDrag=!1;lastDragMoveTime=0;currentDragButton=0;dragMomentumCutoffMs=120;azimuthVelocity=0;elevationVelocity=0;zoomTargetRadius=this.radius;minRadius=1e6;maxRadius=1e15;minElevation=-Math.PI/2+.01;maxElevation=Math.PI/2-.01;freeRotationDamping=.92;orbitalRotationDamping=.92;orbitalZoomDamping=.9;constructor(e,t,i,n){super(e,t,i,n),this.updatePosition(),this.setupEventListeners()}setupEventListeners(){const e=document.getElementById("canvas-container");if(!e)return;this.canvas=e,document.addEventListener("pointerlockchange",()=>{this.pointerLocked=document.pointerLockElement===this.canvas,this.pointerLocked||(this.isDragging=!1)}),e.addEventListener("mousedown",i=>{if((this.freeMode||this.surfaceMode)&&!this.pointerLocked){this.canvas?.requestPointerLock(),i.preventDefault();return}this.ignoredButtons.has(i.button)||(this.isDragging=!0,this.currentDragButton=i.button,this.isRightDrag=i.button===2,this.lastMouseX=i.clientX,this.lastMouseY=i.clientY,this.lastDragMoveTime=performance.now(),this.azimuthVelocity=0,this.elevationVelocity=0,i.preventDefault())}),e.addEventListener("mousemove",i=>{if(this.freeMode&&this.pointerLocked){const a=.002*this.freeLookSensitivity;this.freeRotationDamping<=0?(this.azimuth+=-i.movementX*a,this.elevation+=-i.movementY*a,this.elevation=Math.max(this.minElevation,Math.min(this.maxElevation,this.elevation)),this.azimuthVelocity=0,this.elevationVelocity=0):(this.azimuthVelocity+=-i.movementX*a,this.elevationVelocity+=-i.movementY*a);return}if(this.surfaceMode&&this.pointerLocked){const a=.002*this.surfaceLookSensitivity;this.surfaceRotationDamping<=0?(this.surfaceYaw+=i.movementX*a,this.surfacePitch+=-i.movementY*a,this.surfacePitch=Math.max(-this.surfacePitchLimit,Math.min(this.surfacePitchLimit,this.surfacePitch)),this.surfaceYawVelocity=0,this.surfacePitchVelocity=0):(this.surfaceYawVelocity+=i.movementX*a,this.surfacePitchVelocity+=-i.movementY*a);return}if(!this.isDragging)return;const n=i.clientX-this.lastMouseX,r=i.clientY-this.lastMouseY;if(this.isRightDrag){const a=this.radius*.001,o=Math.cos(this.azimuth),l=-Math.sin(this.azimuth),c=-Math.sin(this.elevation)*Math.sin(this.azimuth),h=Math.cos(this.elevation),d=-Math.sin(this.elevation)*Math.cos(this.azimuth);this.focusX+=(-n*o+r*c)*a,this.focusY+=r*h*a,this.focusZ+=(-n*l+r*d)*a,this.updatePosition()}else this.azimuthVelocity=-n*.005,this.elevationVelocity=r*.005,this.azimuth+=this.azimuthVelocity,this.elevation+=this.elevationVelocity,this.elevation=Math.max(this.minElevation,Math.min(this.maxElevation,this.elevation));this.lastDragMoveTime=performance.now(),this.lastMouseX=i.clientX,this.lastMouseY=i.clientY}),e.addEventListener("mouseup",()=>{this.isDragging=!1}),e.addEventListener("mouseleave",()=>{this.isDragging=!1}),e.addEventListener("wheel",i=>{i.preventDefault();const n=16,r=window.innerHeight||800;let a=i.deltaY;i.deltaMode===1&&(a*=n),i.deltaMode===2&&(a*=r);let l=Math.exp(a*.0015);l=Math.max(.5,Math.min(2,l)),this.zoomTargetRadius*=l,this.zoomTargetRadius=Vi(this.zoomTargetRadius,this.minRadius,this.maxRadius)},{passive:!1}),e.addEventListener("contextmenu",i=>i.preventDefault());let t=0;e.addEventListener("touchstart",i=>{if(i.touches.length===1)this.isDragging=!0,this.lastMouseX=i.touches[0].clientX,this.lastMouseY=i.touches[0].clientY,this.lastDragMoveTime=performance.now(),this.azimuthVelocity=0,this.elevationVelocity=0;else if(i.touches.length===2){const n=i.touches[1].clientX-i.touches[0].clientX,r=i.touches[1].clientY-i.touches[0].clientY;t=Math.sqrt(n*n+r*r)}}),e.addEventListener("touchmove",i=>{if(i.touches.length===1&&this.isDragging){const n=i.touches[0].clientX-this.lastMouseX,r=i.touches[0].clientY-this.lastMouseY,a=.005;this.azimuth-=n*a,this.elevation+=r*a,this.elevation=Math.max(this.minElevation,Math.min(this.maxElevation,this.elevation)),this.lastDragMoveTime=performance.now(),this.lastMouseX=i.touches[0].clientX,this.lastMouseY=i.touches[0].clientY}else if(i.touches.length===2){const n=i.touches[1].clientX-i.touches[0].clientX,r=i.touches[1].clientY-i.touches[0].clientY,a=Math.sqrt(n*n+r*r),o=t/a;this.zoomTargetRadius*=o,this.zoomTargetRadius=Vi(this.zoomTargetRadius,this.minRadius,this.maxRadius),t=a}}),e.addEventListener("touchend",()=>{this.isDragging=!1})}setFov(e){this.fov=e,this.updateProjectionMatrix()}setFreeLookSensitivity(e){!Number.isFinite(e)||e<=0||(this.freeLookSensitivity=e)}setIgnoredButtons(e){this.ignoredButtons.clear();for(const t of e)this.ignoredButtons.add(t);this.isDragging&&this.ignoredButtons.has(this.currentDragButton)&&(this.isDragging=!1)}update(e){if(this.surfaceMode){const i=this.surfaceRotationRate*e;if(i!==0){const n=new w(this.surfaceX-this.surfaceCenterX,this.surfaceY-this.surfaceCenterY,this.surfaceZ-this.surfaceCenterZ);n.applyAxisAngle(this.surfaceRotationAxis,i),this.surfaceX=this.surfaceCenterX+n.x,this.surfaceY=this.surfaceCenterY+n.y,this.surfaceZ=this.surfaceCenterZ+n.z}this.surfaceRotationDamping>0&&(this.surfaceYaw+=this.surfaceYawVelocity*e*60,this.surfacePitch+=this.surfacePitchVelocity*e*60,this.surfacePitch=Math.max(-this.surfacePitchLimit,Math.min(this.surfacePitchLimit,this.surfacePitch)),this.surfaceYawVelocity*=this.surfaceRotationDamping,this.surfacePitchVelocity*=this.surfaceRotationDamping),this.updatePosition();return}if(this.freeMode)this.freeRotationDamping<=0?(this.azimuthVelocity=0,this.elevationVelocity=0):(this.azimuth+=this.azimuthVelocity*e*60,this.elevation+=this.elevationVelocity*e*60,this.elevation=Math.max(this.minElevation,Math.min(this.maxElevation,this.elevation)),this.azimuthVelocity*=this.freeRotationDamping,this.elevationVelocity*=this.freeRotationDamping);else if(this.isDragging)performance.now()-this.lastDragMoveTime>this.dragMomentumCutoffMs&&(this.azimuthVelocity=0,this.elevationVelocity=0);else{this.azimuth+=this.azimuthVelocity*e*60,this.elevation+=this.elevationVelocity*e*60,this.elevation=Math.max(this.minElevation,Math.min(this.maxElevation,this.elevation));const i=this.freeMode?this.freeRotationDamping:this.orbitalRotationDamping;this.azimuthVelocity*=i,this.elevationVelocity*=i}this.zoomTargetRadius=Vi(this.zoomTargetRadius,this.minRadius,this.maxRadius);const t=bg(this.orbitalZoomDamping,e);this.radius+=(this.zoomTargetRadius-this.radius)*t,this.radius=Vi(this.radius,this.minRadius,this.maxRadius),this.updatePosition()}updatePosition(){if(this.surfaceMode){const c=this.getSurfaceFrame(),h=0,d=0,f=0;this.position.set(h,d,f),this.up.copy(c.up),this.lookAt(h+c.forward.x,d+c.forward.y,f+c.forward.z),this.originX=this.surfaceX,this.originY=this.surfaceY,this.originZ=this.surfaceZ;return}const e=Math.cos(this.elevation)*Math.sin(this.azimuth),t=Math.sin(this.elevation),i=Math.cos(this.elevation)*Math.cos(this.azimuth);if(this.freeMode){const c=new w(e,t,i).normalize(),h=new w(0,1,0).applyAxisAngle(c,this.roll),d=this.freeX-this.freeOriginX,f=this.freeY-this.freeOriginY,p=this.freeZ-this.freeOriginZ;this.position.set(d,f,p),this.up.copy(h),this.lookAt(d+e,f+t,p+i),this.originX=this.freeOriginX,this.originY=this.freeOriginY,this.originZ=this.freeOriginZ;return}const n=this.radius*Math.cos(this.elevation)*Math.sin(this.azimuth),r=this.radius*Math.sin(this.elevation),a=this.radius*Math.cos(this.elevation)*Math.cos(this.azimuth),o=new w(-n,-r,-a).normalize(),l=new w(0,1,0).applyAxisAngle(o,this.roll);this.position.set(n,r,a),this.up.copy(l),this.lookAt(0,0,0),this.originX=this.focusX+n,this.originY=this.focusY+r,this.originZ=this.focusZ+a}setDistance(e){this.radius=Vi(e,this.minRadius,this.maxRadius),this.zoomTargetRadius=this.radius,this.updatePosition()}getDistance(){return this.radius}getCameraWorldPosition(){return this.freeMode?{x:this.freeX,y:this.freeY,z:this.freeZ}:this.surfaceMode?{x:this.surfaceX,y:this.surfaceY,z:this.surfaceZ}:{x:this.originX,y:this.originY,z:this.originZ}}setFocus(e,t,i){this.focusX=e,this.focusY=t,this.focusZ=i,this.updatePosition()}setOrbitFromOffset(e){const t=Math.sqrt(e.x*e.x+e.y*e.y+e.z*e.z);if(!Number.isFinite(t)||t<=0)return;this.radius=Vi(t,this.minRadius,this.maxRadius),this.azimuth=Dl(this.azimuth,Math.atan2(e.x,e.z));const i=Math.max(-1,Math.min(1,e.y/this.radius));this.elevation=Math.asin(i),this.azimuthVelocity=0,this.elevationVelocity=0,this.zoomTargetRadius=this.radius,this.updatePosition()}setFreeMode(e,t,i,n){if(e&&(this.surfaceMode=!1),this.freeMode=e,e){if(t&&(this.freeX=t.x,this.freeY=t.y,this.freeZ=t.z),n?(this.freeOriginX=n.x,this.freeOriginY=n.y,this.freeOriginZ=n.z):(this.freeOriginX=this.freeX,this.freeOriginY=this.freeY,this.freeOriginZ=this.freeZ),i){const r=new w(i.x,i.y,i.z).normalize(),a=Math.max(-1,Math.min(1,r.y));this.azimuth=Dl(this.azimuth,Math.atan2(r.x,r.z)),this.elevation=Math.asin(a),this.azimuthVelocity=0,this.elevationVelocity=0}this.isDragging=!1,this.canvas?.requestPointerLock()}else document.pointerLockElement&&document.exitPointerLock();this.updatePosition()}setSurfaceMode(e,t){if(this.surfaceMode=e,!e){document.pointerLockElement&&document.exitPointerLock(),this.updatePosition();return}if(t){this.surfaceCenterX=t.center.x,this.surfaceCenterY=t.center.y,this.surfaceCenterZ=t.center.z,this.surfaceBodyRadius=Number.isFinite(t.radius)?t.radius:this.surfaceBodyRadius,this.surfaceRotationRate=Number.isFinite(t.rotationRate)?t.rotationRate:0,this.surfaceRotationAxis=this.getRotationAxis(t.axialTilt),typeof t.eyeHeight=="number"&&(this.surfaceEyeHeight=Math.max(.1,t.eyeHeight));const i=t.seedWorld,n=t.seedForward,r=this.getSurfaceUp(i),a=this.surfaceBodyRadius+this.surfaceEyeHeight;this.surfaceX=this.surfaceCenterX+r.x*a,this.surfaceY=this.surfaceCenterY+r.y*a,this.surfaceZ=this.surfaceCenterZ+r.z*a,n&&this.applySurfaceSeedForward(n,r)}this.freeMode=!1,this.isDragging=!1,this.surfaceYawVelocity=0,this.surfacePitchVelocity=0,this.updatePosition()}isSurfaceMode(){return this.surfaceMode}setSurfaceTarget(e){const t=e.center.x-this.surfaceCenterX,i=e.center.y-this.surfaceCenterY,n=e.center.z-this.surfaceCenterZ;this.surfaceX+=t,this.surfaceY+=i,this.surfaceZ+=n,this.surfaceCenterX=e.center.x,this.surfaceCenterY=e.center.y,this.surfaceCenterZ=e.center.z,this.surfaceBodyRadius=Number.isFinite(e.radius)?e.radius:this.surfaceBodyRadius,this.surfaceRotationRate=Number.isFinite(e.rotationRate)?e.rotationRate:0,this.surfaceRotationAxis=this.getRotationAxis(e.axialTilt);const r=this.surfaceBodyRadius+this.surfaceEyeHeight,a=new w(this.surfaceX-this.surfaceCenterX,this.surfaceY-this.surfaceCenterY,this.surfaceZ-this.surfaceCenterZ);a.lengthSq()<1e-6&&a.set(0,1,0),a.length()<r&&(a.normalize().multiplyScalar(r),this.surfaceX=this.surfaceCenterX+a.x,this.surfaceY=this.surfaceCenterY+a.y,this.surfaceZ=this.surfaceCenterZ+a.z)}setSurfaceLookSensitivity(e){!Number.isFinite(e)||e<=0||(this.surfaceLookSensitivity=e)}setSurfaceRotationDamping(e){Number.isFinite(e)&&(this.surfaceRotationDamping=Math.max(0,Math.min(.999,e)))}setSurfaceEyeHeight(e){if(!(!Number.isFinite(e)||e<=0)&&(this.surfaceEyeHeight=e,this.surfaceMode)){const t=this.surfaceBodyRadius+this.surfaceEyeHeight,i=new w(this.surfaceX-this.surfaceCenterX,this.surfaceY-this.surfaceCenterY,this.surfaceZ-this.surfaceCenterZ);i.lengthSq()<1e-6&&i.set(0,1,0),i.normalize().multiplyScalar(t),this.surfaceX=this.surfaceCenterX+i.x,this.surfaceY=this.surfaceCenterY+i.y,this.surfaceZ=this.surfaceCenterZ+i.z}}moveSurface(e,t,i,n,r){if(!this.surfaceMode||!Number.isFinite(r)||r<=0)return;const a=this.getSurfaceFrame(),o=new w;e!==0&&o.addScaledVector(a.forwardTangent,e),t!==0&&o.addScaledVector(a.right,t),i!==0&&o.addScaledVector(a.up,i),o.lengthSq()>0&&(o.normalize().multiplyScalar(r*n),this.surfaceX+=o.x,this.surfaceY+=o.y,this.surfaceZ+=o.z);const l=this.surfaceBodyRadius+this.surfaceEyeHeight,c=new w(this.surfaceX-this.surfaceCenterX,this.surfaceY-this.surfaceCenterY,this.surfaceZ-this.surfaceCenterZ);c.length()<l&&(c.normalize().multiplyScalar(l),this.surfaceX=this.surfaceCenterX+c.x,this.surfaceY=this.surfaceCenterY+c.y,this.surfaceZ=this.surfaceCenterZ+c.z)}getRotationAxis(e){if(!Number.isFinite(e))return new w(0,1,0);const t=new w(-Math.sin(e),Math.cos(e),0);return t.lengthSq()<1e-6?new w(0,1,0):t.normalize()}getSurfaceUp(e){if(e){const t=new w(e.x-this.surfaceCenterX,e.y-this.surfaceCenterY,e.z-this.surfaceCenterZ);if(t.lengthSq()>1e-6)return t.normalize()}return new w(0,1,0)}applySurfaceSeedForward(e,t){const i=new w(e.x,e.y,e.z).normalize(),n=i.dot(t),r=Math.asin(Math.max(-1,Math.min(1,n))),a=i.clone().sub(t.clone().multiplyScalar(n));if(a.lengthSq()<1e-6){this.surfacePitch=Math.max(-this.surfacePitchLimit,Math.min(this.surfacePitchLimit,r));return}const o=this.getSurfaceFrameFromUp(t),l=o.east,c=o.north,h=a.normalize();this.surfaceYaw=Math.atan2(h.dot(l),h.dot(c)),this.surfacePitch=Math.max(-this.surfacePitchLimit,Math.min(this.surfacePitchLimit,r))}getSurfaceFrameFromUp(e){const t=new w().crossVectors(this.surfaceRotationAxis,e);t.lengthSq()<1e-6&&(t.set(1,0,0).cross(e),t.lengthSq()<1e-6&&t.set(0,0,1).cross(e)),t.normalize();const i=new w().crossVectors(e,t).normalize();return{up:e,east:t,north:i}}getSurfaceFrame(){const e=new w(this.surfaceX-this.surfaceCenterX,this.surfaceY-this.surfaceCenterY,this.surfaceZ-this.surfaceCenterZ);e.lengthSq()<1e-6?e.set(0,1,0):e.normalize();const t=this.getSurfaceFrameFromUp(e),i=Math.cos(this.surfaceYaw),n=Math.sin(this.surfaceYaw),r=new w().addScaledVector(t.north,i).addScaledVector(t.east,n).normalize(),a=new w().crossVectors(r,t.up).normalize(),o=new w().addScaledVector(r,Math.cos(this.surfacePitch)).addScaledVector(t.up,Math.sin(this.surfacePitch)).normalize();return{up:t.up,east:t.east,north:t.north,forward:o,forwardTangent:r,right:a}}isFreeMode(){return this.freeMode}moveFree(e,t,i){this.freeMode&&(this.freeX+=e,this.freeY+=t,this.freeZ+=i,this.updatePosition())}setElevation(e){this.elevation=Math.max(this.minElevation,Math.min(this.maxElevation,e)),this.updatePosition()}nudgeOrbit(e,t){this.freeMode||!Number.isFinite(e)||!Number.isFinite(t)||(this.azimuth+=e,this.elevation=Math.max(this.minElevation,Math.min(this.maxElevation,this.elevation+t)))}nudgeRoll(e){Number.isFinite(e)&&(this.roll+=e)}nudgeOrbitZoom(e){this.freeMode||!Number.isFinite(e)||e<=0||(this.zoomTargetRadius*=e,this.zoomTargetRadius=Vi(this.zoomTargetRadius,this.minRadius,this.maxRadius))}setFreeRotationDamping(e){Number.isFinite(e)&&(this.freeRotationDamping=Math.max(0,Math.min(.999,e)))}setOrbitalRotationDamping(e){Number.isFinite(e)&&(this.orbitalRotationDamping=Math.max(0,Math.min(.999,e)))}setOrbitalZoomDamping(e){Number.isFinite(e)&&(this.orbitalZoomDamping=Math.max(0,Math.min(.999,e)))}setMinimumOrbitDistance(e){!Number.isFinite(e)||e<=0||(this.minRadius=Math.min(e,this.maxRadius),this.radius=Math.max(this.radius,this.minRadius),this.zoomTargetRadius=Math.max(this.zoomTargetRadius,this.minRadius),this.updatePosition())}setTrackedBodyRadius(e){this.setMinimumOrbitDistance(_g(e))}getWorldOrigin(){return{x:this.originX,y:this.originY,z:this.originZ}}worldToRender(e,t,i){return new w(e-this.originX,t-this.originY,i-this.originZ)}configureForScale(e){const t=nr[e];this.maxRadius=t.maxRadius,this.far=t.far,this.updateProjectionMatrix()}setInitialDistance(e){const t=this.maxRadius;this.maxRadius=Math.max(this.maxRadius,e),this.radius=Math.max(this.minRadius,Math.min(this.maxRadius,e)),this.zoomTargetRadius=this.radius,this.maxRadius=t,this.updatePosition()}}function rs(s){const[e,t,i]=wg(s);return[e/255,t/255,i/255]}function wg(s){const e=Math.max(1e3,Math.min(55e3,s))/100;let t,i,n;return e<=66?t=255:t=329.698727446*Math.pow(e-60,-.1332047592),e<=66?i=99.4708025861*Math.log(e)-161.1195681661:i=288.1221695283*Math.pow(e-60,-.0755148492),e>=66?n=255:e<=19?n=0:n=138.5177312231*Math.log(e-10)-305.0447927307,[Math.round(Math.max(0,Math.min(255,t))),Math.round(Math.max(0,Math.min(255,i))),Math.round(Math.max(0,Math.min(255,n)))]}function Tg(s){return s<.76?2400+s/.76*1300:s<.88?3700+(s-.76)/.12*1500:s<.956?5200+(s-.88)/.076*800:s<.986?6e3+(s-.956)/.03*1500:s<.996?7500+(s-.986)/.01*2500:s<.999?1e4+(s-.996)/.003*2e4:3e4+(s-.999)/.001*2e4}class Rg{sources=new Map;_resultBuffer=new Array(4).fill(null);_scratchBrightness=new Float64Array(4);_resultCount=0;registerSource(e,t){this.sources.set(e,t)}removeSource(e){this.sources.delete(e)}updatePosition(e,t,i,n){const r=this.sources.get(e);r&&r.position.set(t,i,n)}getSignificantSources(e,t){const i=Math.min(t,4);let n=0;for(const r of this.sources.values()){const a=r.position.distanceToSquared(e),o=r.luminosity/Math.max(a,1e-8);let l=n;for(;l>0&&o>this._scratchBrightness[l-1];)l--;if(l<i){const c=Math.min(n,i-1);for(let h=c;h>l;h--)this._resultBuffer[h]=this._resultBuffer[h-1],this._scratchBrightness[h]=this._scratchBrightness[h-1];this._resultBuffer[l]=r,this._scratchBrightness[l]=o,n<i&&n++}}return this._resultCount=n,this._resultBuffer}get resultCount(){return this._resultCount}get count(){return this.sources.size}forEachSource(e){for(const t of this.sources.values())e(t)}}class Cg{casters=new Map;casterArray=[];_resultBuffer=new Array(4).fill(null);_scratchScore=new Float64Array(4);_resultCount=0;_lightDirX=new Float64Array(4);_lightDirY=new Float64Array(4);_lightDirZ=new Float64Array(4);registerCaster(e,t){this.casters.set(e,t),this.casterArray.push(t)}removeCaster(e){this.casters.delete(e);const t=this.casterArray.findIndex(i=>i.id===e);t>=0&&this.casterArray.splice(t,1)}updatePosition(e,t,i,n){const r=this.casters.get(e);r&&r.position.set(t,i,n)}getSignificantCasters(e,t,i,n,r){const a=Math.min(r,4);let o=0;const l=t.x,c=t.y,h=t.z,d=this.casterArray,f=d.length;for(let p=0;p<n;p++){const g=i[p];if(g){const y=g.position.x-l,m=g.position.y-c,u=g.position.z-h,v=y*y+m*m+u*u;if(v>1e-12){const _=1/Math.sqrt(v);this._lightDirX[p]=y*_,this._lightDirY[p]=m*_,this._lightDirZ[p]=u*_}else this._lightDirX[p]=0,this._lightDirY[p]=0,this._lightDirZ[p]=0}}for(let p=0;p<f;p++){const g=d[p];if(g.id===e)continue;const y=g.position.x-l,m=g.position.y-c,u=g.position.z-h,v=y*y+m*m+u*u,_=g.radius*g.radius/Math.max(v,1e-8);if(_<1e-6)continue;let x=0;for(let P=0;P<n;P++){if(!i[P])continue;const M=y*this._lightDirX[P]+m*this._lightDirY[P]+u*this._lightDirZ[P];M>x&&(x=M)}if(x<=0)continue;const T=x/Math.sqrt(v),C=_*Math.pow(T,16);let A=o;for(;A>0&&C>this._scratchScore[A-1];)A--;if(A<a){const P=Math.min(o,a-1);for(let M=P;M>A;M--)this._resultBuffer[M]=this._resultBuffer[M-1],this._scratchScore[M]=this._scratchScore[M-1];this._resultBuffer[A]=g,this._scratchScore[A]=C,o<a&&o++}}return this._resultCount=o,this._resultBuffer}get resultCount(){return this._resultCount}}const Ag=`
#include <common>
#include <logdepthbuf_pars_vertex>
varying vec3 vNormal;
varying vec3 vViewDir;
varying vec3 vObjNormal;
void main() {
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vViewDir = normalize(-mvPos.xyz);
    vObjNormal = normalize(normal);
    gl_Position = projectionMatrix * mvPos;
    #include <logdepthbuf_vertex>
}
`,Pg=`
#include <common>
#include <logdepthbuf_pars_fragment>
uniform vec3 u_color;   // blackbody RGB [0,1]
uniform float u_limbA;
uniform float u_limbB;
uniform sampler2D u_granulationMap;
uniform float u_granulationStrength;
uniform vec2 u_drift;
uniform float u_spotPhase;
uniform float u_spotFraction;
uniform float u_spotEnabled;
uniform float u_spotSeed;
uniform float u_emissiveStrength;
varying vec3 vNormal;
varying vec3 vViewDir;
varying vec3 vObjNormal;

float hash11(float p) {
    p = fract(p * 0.1031);
    p *= p + 33.33;
    p *= p + p;
    return fract(p);
}

vec3 randomOnSphere(float idx, float seed) {
    float u = hash11(idx * 17.13 + seed * 3.7) * 2.0 - 1.0;
    float a = 6.28318530718 * hash11(idx * 29.73 + seed * 5.1);
    float s = sqrt(max(0.0, 1.0 - u * u));
    return vec3(cos(a) * s, sin(a) * s, u);
}

vec3 rotateY(vec3 v, float a) {
    float c = cos(a);
    float s = sin(a);
    return vec3(v.x * c - v.z * s, v.y, v.x * s + v.z * c);
}

float sampleGranulation(vec3 n, float scale, vec2 drift, float phase) {
    vec3 an = abs(n);
    vec3 w = pow(an, vec3(10.0));
    w /= dot(w, vec3(1.0));

    vec2 pX = n.yz * scale;
    vec2 pY = n.zx * scale;
    vec2 pZ = n.xy * scale;

    float sx1 = texture2D(u_granulationMap, pX + drift).r;
    float sy1 = texture2D(u_granulationMap, pY + drift * vec2(1.0, 2.0)).r;
    float sz1 = texture2D(u_granulationMap, pZ + drift * vec2(2.0, -1.0)).r;
    float baseTex = sx1 * w.x + sy1 * w.y + sz1 * w.z;
    
    float sx2 = texture2D(u_granulationMap, pX * 2.13 - drift).r;
    float sy2 = texture2D(u_granulationMap, pY * 2.13 - drift * vec2(-1.0, 1.0)).r;
    float sz2 = texture2D(u_granulationMap, pZ * 2.13 - drift * vec2(1.0, -2.0)).r;
    float detailTex = sx2 * w.x + sy2 * w.y + sz2 * w.z;

    float pulse = sin(phase * 40.0 + baseTex * 10.0) * 0.05;
    float gran = baseTex * 0.7 + detailTex * 0.3 + pulse;
    return smoothstep(0.15, 0.85, gran);
}

void main() {
    float mu = max(dot(normalize(vNormal), normalize(vViewDir)), 0.0);
    float limb = 1.0 - u_limbA * (1.0 - mu) - u_limbB * (1.0 - mu) * (1.0 - mu);
    vec3 objN = normalize(vObjNormal);
    vec2 drift = u_drift;
    float granTex = sampleGranulation(objN, 5.8, drift, u_spotPhase);
    float granulation = mix(1.0, 0.84 + 0.34 * granTex, u_granulationStrength);

    // D6: Seeded starspots (Ultra) with slow drift
    float spotCoverage = clamp(u_spotFraction / 0.3, 0.0, 1.0) * u_spotEnabled;
    float spotCount = floor(clamp(u_spotFraction * 80.0, 0.0, 24.0) + 0.5);
    float spotDarkening = 0.0;
    for (int i = 0; i < 24; i++) {
        float fi = float(i);
        if (fi >= spotCount) {
            continue;
        }

        vec3 center = randomOnSphere(fi + 1.0, u_spotSeed);

        // Keep most spots away from poles for a more solar-like pattern
        center.y *= 0.75;
        center = normalize(center);

        // Slow longitudinal drift (seeded)
        float driftAngle = 0.07 * sin(u_spotPhase + fi * 1.7 + u_spotSeed * 0.01);
        center = normalize(rotateY(center, driftAngle));

        float radius = mix(0.035, 0.095, hash11(fi * 11.3 + u_spotSeed * 0.7));
        float d = dot(objN, center);
        float core = smoothstep(cos(radius), cos(radius * 0.55), d);

        // Darkness corresponds to cooler spot regions (ΔT-like visual approximation)
        float darkness = mix(0.18, 0.38, hash11(fi * 23.7 + u_spotSeed * 1.9));
        spotDarkening = max(spotDarkening, core * darkness);
    }

    vec3 finalColor = u_color * limb * granulation;
    finalColor *= (1.0 - spotCoverage * spotDarkening);

    gl_FragColor = vec4(finalColor * u_emissiveStrength, 1.0);
    #include <logdepthbuf_fragment>
}
`,Sc=`
#include <common>
#include <logdepthbuf_pars_vertex>
varying vec3 vWorldNormal;
varying vec3 vWorldPos;
void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPosition.xyz;
    vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
    
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
    #include <logdepthbuf_vertex>
}
`,Mc=`
#include <common>
#include <logdepthbuf_pars_fragment>
uniform vec3 u_rayleighColor;   // Rayleigh scattering coefficients
uniform vec3 u_mieColor;        // Mie scattering coefficients
uniform float u_intensity;

#define MAX_LIGHTS 4
uniform int u_numLights;
uniform vec3 u_lightPos[MAX_LIGHTS];
uniform vec3 u_lightColor[MAX_LIGHTS];
uniform float u_lightIntensity[MAX_LIGHTS];

uniform vec3 u_planetCenter;
uniform float u_planetRadius;
uniform float u_atmoRadius;
uniform float u_isInside;
uniform float u_scaleHeight;    // Scale height ratio: H / atmosphereThickness (dimensionless)

varying vec3 vWorldNormal;
varying vec3 vWorldPos;

// Henyey-Greenstein phase function for Mie scattering
float henyeyGreenstein(float cosTheta, float g) {
    float g2 = g * g;
    return (1.0 - g2) / (4.0 * 3.14159 * pow(max(1.0 + g2 - 2.0 * g * cosTheta, 1e-4), 1.5));
}

// Ray-sphere intersection: returns (tNear, tFar) or (-1,-1) if no hit
vec2 raySphereIntersect(vec3 ro, vec3 rd, vec3 sc, float sr) {
    vec3 oc = ro - sc;
    float b = dot(oc, rd);
    float c = dot(oc, oc) - sr * sr;
    float disc = b * b - c;
    if (disc < 0.0) return vec2(-1.0);
    float sq = sqrt(disc);
    return vec2(-b - sq, -b + sq);
}

void main() {
    vec3 normal = normalize(vWorldNormal);
    // Standard viewDir: vector FROM camera TO fragment
    vec3 viewDir = normalize(vWorldPos - cameraPosition);
    vec3 zenithDir = normalize(vWorldPos - u_planetCenter);

    float shellThickness = max(u_atmoRadius - u_planetRadius, 1e-5);
    float fragAlt = max(length(vWorldPos - u_planetCenter) - u_planetRadius, 0.0);
    float altFrac = clamp(fragAlt / shellThickness, 0.0, 1.0);

    // ── Optical depth via ray-sphere chord length ──
    vec3 camToFrag = viewDir;
    vec2 outerHit = raySphereIntersect(cameraPosition, camToFrag, u_planetCenter, u_atmoRadius);
    vec2 innerHit = raySphereIntersect(cameraPosition, camToFrag, u_planetCenter, u_planetRadius);

    float pathLength = 0.0;

    if (u_isInside > 0.5) {
        // ── Interior view (surface camera) ──
        // cosZenith = dot(zenithDir, viewDir): +1.0 overhead at zenith, 0.0 at horizon
        float cosZenith = dot(zenithDir, viewDir);
        float airmass = 1.0 / max(cosZenith, 0.035); // Smooth airmass from 1.0 (zenith) to ~28.5 (horizon)
        pathLength = airmass;
    } else {
        // ── Exterior view (orbital camera) ──
        float enterT = max(outerHit.x, 0.0);
        float exitT = outerHit.y;
        if (innerHit.x > 0.0) {
            exitT = innerHit.x;
        }
        float chord = max(exitT - enterT, 0.0);
        pathLength = chord / shellThickness;
        float densityWeight = exp(-altFrac / max(u_scaleHeight, 0.01));
        pathLength *= densityWeight;
    }

    // Safe optical depth calculation to prevent numerical underflow in exp()
    vec3 safeRayleigh = clamp(u_rayleighColor, vec3(0.0), vec3(4.0));
    vec3 safeMie = clamp(u_mieColor, vec3(0.0), vec3(4.0));
    vec3 opticalDepth = (safeRayleigh + safeMie) * pathLength;
    vec3 transmittance = exp(-opticalDepth);
    vec3 safeDensity = max(safeRayleigh + safeMie, vec3(1e-4));
    vec3 scatterIntegral = (1.0 - transmittance) / safeDensity;

    vec3 finalColor = vec3(0.0);

    for (int i = 0; i < MAX_LIGHTS; i++) {
        if (i >= u_numLights) break;
        
        vec3 lightVec = u_lightPos[i] - vWorldPos;
        float distSq = max(dot(lightVec, lightVec), 1.0);
        vec3 lightDir = lightVec * inversesqrt(max(distSq, 1e-12));
        
        // Phase angle between view ray and light direction
        float cosTheta = dot(viewDir, lightDir);
        
        // ── Terminator / twilight transition ──
        float rRatio = min(1.0, u_planetRadius / u_atmoRadius);
        float termCos = -sqrt(max(1.0 - rRatio * rRatio, 0.0));
        float sunDotZenith = dot(zenithDir, lightDir);
        float termWidth = (u_isInside > 0.5) ? 0.40 : 0.25;
        float sunInfluence = smoothstep(termCos - termWidth, termCos + 0.15, sunDotZenith);
        
        if (u_isInside > 0.5) {
            float twilightExtend = smoothstep(termCos - 0.50, termCos - 0.10, sunDotZenith) * 0.20;
            sunInfluence = max(sunInfluence, twilightExtend);
        }
        
        float attenuation = 1.0 / distSq;
        
        // Rayleigh Phase Function
        float rayleighPhase = 0.75 * (1.0 + cosTheta * cosTheta);
        vec3 rayleighScattering = safeRayleigh * rayleighPhase;
        
        // Mie Phase Function: high g parameter (0.86) for crisp solar aureole
        float miePhase = henyeyGreenstein(cosTheta, 0.86) + 0.02;
        vec3 mieScattering = safeMie * miePhase;
        
        vec3 scatterColor = rayleighScattering + mieScattering;
        vec3 lightContrib = scatterColor * scatterIntegral;
        
        // Extinction of direct sunlight for surface camera
        if (u_isInside > 0.5) {
            float sunCosZenith = max(sunDotZenith, 0.025);
            float sunAirmass = 1.0 / sunCosZenith;
            vec3 sunTransmittance = exp(-safeRayleigh * sunAirmass * 0.4);
            lightContrib *= sunTransmittance;
        }
        
        finalColor += lightContrib * sunInfluence * (u_lightColor[i] * (u_lightIntensity[i] * attenuation));

        // Reduce bright star contribution (temporary)
        finalColor *= 0.5;
    }
    
    // Alpha computation
    float lum = max(finalColor.r, max(finalColor.g, finalColor.b));
    float alpha;
    if (u_isInside > 0.5) {
        alpha = clamp(lum * 2.5 + 0.05, 0.0, 1.0);
    } else {
        alpha = clamp(lum * 1.5, 0.0, 1.0);
    }
    
    gl_FragColor = vec4(finalColor, alpha);
    #include <logdepthbuf_fragment>
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
`,Ig=`
#include <common>
#include <logdepthbuf_pars_vertex>
varying vec3 vWorldNormal;
varying vec3 vViewDir;
varying vec3 vWorldPos;
varying vec2 vUv;
void main() {
    vUv = uv;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPosition.xyz;
    vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
    vViewDir = normalize(cameraPosition - worldPosition.xyz);
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
    #include <logdepthbuf_vertex>
}
`,Dg=`
#include <common>
#include <logdepthbuf_pars_fragment>
uniform sampler2D u_ringMap;

#define MAX_LIGHTS 4
#define MAX_CASTERS 4
uniform int u_numLights;
uniform vec3 u_lightPos[MAX_LIGHTS];
uniform vec3 u_lightColor[MAX_LIGHTS];
uniform float u_lightIntensity[MAX_LIGHTS];
uniform float u_lightRadius[MAX_LIGHTS];

uniform int u_numCasters;
uniform vec3 u_casterPos[MAX_CASTERS];
uniform float u_casterRadius[MAX_CASTERS];
uniform int u_shadowQuality; // 0=Off, 1=Binary, 2=Penumbra

uniform vec3 u_planetCenter;
uniform float u_planetRadius;
uniform float u_g; // Henyey-Greenstein scattering parameter
uniform float u_perfMode;
uniform float u_isHorizontal;
uniform float u_textureVScale;

varying vec3 vWorldNormal;
varying vec3 vViewDir;
varying vec3 vWorldPos;
varying vec2 vUv;

// Henyey-Greenstein phase function for forward/back scattering
float henyeyGreenstein(float cosTheta, float g) {
    float g2 = g * g;
    return (1.0 - g2) / (4.0 * 3.14159 * pow(1.0 + g2 - 2.0 * g * cosTheta, 1.5));
}

float diskOverlapArea(float d, float r1, float r2) {
    if (d >= r1 + r2) return 0.0;
    if (d <= abs(r1 - r2)) {
        float r = min(r1, r2);
        return 3.14159265359 * r * r;
    }
    float r1sq = r1 * r1;
    float r2sq = r2 * r2;
    float dsq = d * d;
    float a1 = acos(clamp((dsq + r1sq - r2sq) / (2.0 * d * r1), -1.0, 1.0));
    float a2 = acos(clamp((dsq + r2sq - r1sq) / (2.0 * d * r2), -1.0, 1.0));
    return r1sq * a1 + r2sq * a2 - 0.5 * sqrt(max(0.0, 4.0 * dsq * r1sq - pow(dsq + r1sq - r2sq, 2.0)));
}

void main() {
    // Look up ring color/opacity from 1D radial map
    vec2 samplePos = u_isHorizontal > 0.5 ? vec2(vUv.y * u_textureVScale, 0.5) : vec2(0.5, vUv.y * u_textureVScale);
    if (samplePos.x > 1.0 || samplePos.y > 1.0) discard;
    
    vec4 ring = texture2D(u_ringMap, samplePos);
    if (ring.a < 0.01) discard;

    vec3 normal = normalize(vWorldNormal);
    vec3 viewDir = normalize(vViewDir);

    // 1. View-Angle Transparency: edge-on = more transparent
    float viewAngle = abs(dot(normal, viewDir));
    float viewFade = smoothstep(0.0, 0.12, viewAngle);

    vec3 finalColor = vec3(0.0);

    for (int i = 0; i < MAX_LIGHTS; i++) {
        if (i >= u_numLights) break;
        
        vec3 lightVec = u_lightPos[i] - vWorldPos;
        float distSq = max(dot(lightVec, lightVec), 1.0);
        vec3 lightDir = lightVec * inversesqrt(max(distSq, 1e-12));
        float attenuation = 1.0 / distSq;

        // 2. Planet Shadow (Ray-Sphere intersection)
        vec3 oc = vWorldPos - u_planetCenter;
        float b = dot(oc, lightDir);
        float c = dot(oc, oc) - u_planetRadius * u_planetRadius;
        float disc = b * b - c;
        float inShadow = (disc > 0.0 && b < 0.0) ? 0.05 : 1.0;

        // 3. Eclipse Shadows
        if (u_shadowQuality > 0) {
            float lightAngularRadius = u_lightRadius[i] / sqrt(distSq);
            float lightArea = 3.14159265359 * lightAngularRadius * lightAngularRadius;

            for (int j = 0; j < MAX_CASTERS; j++) {
                if (j >= u_numCasters) break;
                
                vec3 toCaster = u_casterPos[j] - vWorldPos;
                float distCaster = length(toCaster);
                
                // Ignore casters behind the light
                if (distCaster >= sqrt(distSq)) continue;
                
                vec3 casterDir = toCaster / distCaster;
                float angularDist = length(lightDir - casterDir);
                float casterAngularRadius = u_casterRadius[j] / distCaster;
                
                if (u_shadowQuality == 1) { // Binary
                    if (angularDist < casterAngularRadius) {
                        inShadow = 0.05;
                    }
                } else { // Penumbra
                    float overlap = diskOverlapArea(angularDist, lightAngularRadius, casterAngularRadius);
                    float occludedFrac = clamp(overlap / lightArea, 0.0, 1.0);
                    // map occluded to 1.0->0.05
                    inShadow = min(inShadow, mix(1.0, 0.05, occludedFrac));
                }
            }
        }

        if (u_perfMode > 0.5) {
            finalColor += ring.rgb * inShadow * u_lightColor[i] * (u_lightIntensity[i] * attenuation);
        } else {
            // Rings are double-sided, so abs(dot(N, L)) for diffuse
            float NdotL = abs(dot(normal, lightDir));
            float diffuse = max(NdotL, 0.05);

            float cosTheta = dot(viewDir, lightDir);
            float scattering = henyeyGreenstein(cosTheta, u_g);
            
            float lighting = mix(diffuse, scattering * 5.0, 0.4);

            finalColor += ring.rgb * lighting * inShadow * u_lightColor[i] * (u_lightIntensity[i] * attenuation);
        }
    }

    if (u_perfMode > 0.5) {
        gl_FragColor = vec4(finalColor, ring.a * viewFade);
    } else {
        gl_FragColor = vec4(finalColor, ring.a * viewFade);
    }
    #include <logdepthbuf_fragment>
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
`;function Lg(s){let e=[],t=.3,i=1;return s==="saturn"?(t=.7,e=[{pos:0,color:"#ffffff",alpha:0},{pos:.009,color:"#ffffff",alpha:.03},{pos:.018,color:"#ffffff",alpha:0},{pos:.019,color:"#9ca6b5",alpha:.05},{pos:.04,color:"#9ca6b5",alpha:.35},{pos:.06,color:"#8b96a8",alpha:.2},{pos:.061,color:"#000000",alpha:0},{pos:.062,color:"#e0c8b0",alpha:.9},{pos:.09,color:"#d9c0a3",alpha:.99},{pos:.122,color:"#e0c8b0",alpha:.85},{pos:.123,color:"#000000",alpha:0},{pos:.124,color:"#000000",alpha:.02},{pos:.128,color:"#c3b294",alpha:.1},{pos:.133,color:"#000000",alpha:.02},{pos:.134,color:"#000000",alpha:0},{pos:.135,color:"#d7c8a5",alpha:.7},{pos:.155,color:"#d7c8a5",alpha:.65},{pos:.16,color:"#d7c8a5",alpha:.6},{pos:.161,color:"#000000",alpha:0},{pos:.162,color:"#d2c3a0",alpha:.55},{pos:.167,color:"#d2c3a0",alpha:.5},{pos:.168,color:"#000000",alpha:0},{pos:.169,color:"#cdbe9b",alpha:.4},{pos:.176,color:"#000000",alpha:0},{pos:.177,color:"#e0c8b0",alpha:.5},{pos:.178,color:"#000000",alpha:0},{pos:1,color:"#000000",alpha:0}]):s==="uranus"?(t=.5,e=[{pos:0,color:"#333333",alpha:.05},{pos:.035,color:"#333333",alpha:.05},{pos:.036,color:"#000000",alpha:0},{pos:.038,color:"#555555",alpha:.45},{pos:.039,color:"#000000",alpha:0},{pos:.045,color:"#555555",alpha:.45},{pos:.046,color:"#000000",alpha:0},{pos:.051,color:"#555555",alpha:.45},{pos:.052,color:"#000000",alpha:0},{pos:.087,color:"#555555",alpha:.45},{pos:.088,color:"#000000",alpha:0},{pos:.103,color:"#555555",alpha:.45},{pos:.104,color:"#000000",alpha:0},{pos:.128,color:"#555555",alpha:.45},{pos:.129,color:"#000000",alpha:0},{pos:.136,color:"#555555",alpha:.45},{pos:.137,color:"#000000",alpha:0},{pos:.147,color:"#555555",alpha:.45},{pos:.148,color:"#000000",alpha:0},{pos:.176,color:"#555555",alpha:.3},{pos:.177,color:"#000000",alpha:0},{pos:.194,color:"#000000",alpha:0},{pos:.195,color:"#888888",alpha:.6},{pos:.197,color:"#000000",alpha:0},{pos:.46,color:"#000000",alpha:0},{pos:.468,color:"#774444",alpha:.15},{pos:.475,color:"#774444",alpha:.15},{pos:.48,color:"#000000",alpha:0},{pos:.96,color:"#000000",alpha:0},{pos:.979,color:"#446699",alpha:.15},{pos:.99,color:"#446699",alpha:.15},{pos:1,color:"#000000",alpha:0}]):s==="neptune"?(t=.5,e=[{pos:0,color:"#000000",alpha:0},{pos:.007,color:"#5a606a",alpha:.2},{pos:.05,color:"#5a606a",alpha:.2},{pos:.097,color:"#000000",alpha:0},{pos:.51,color:"#000000",alpha:0},{pos:.512,color:"#5a606a",alpha:.5},{pos:.514,color:"#000000",alpha:0},{pos:.6,color:"#000000",alpha:0},{pos:.602,color:"#5a606a",alpha:.2},{pos:.69,color:"#5a606a",alpha:.2},{pos:.692,color:"#5a606a",alpha:.4},{pos:.694,color:"#5a606a",alpha:.2},{pos:.782,color:"#000000",alpha:0},{pos:.949,color:"#000000",alpha:0},{pos:.951,color:"#6a707a",alpha:.6},{pos:.953,color:"#000000",alpha:0},{pos:1,color:"#000000",alpha:0}]):s==="jupiter"?(t=.5,e=[{pos:0,color:"#000000",alpha:0},{pos:.1,color:"#a08264",alpha:0},{pos:.9,color:"#a08264",alpha:0},{pos:1,color:"#000000",alpha:0}]):e=[{pos:0,color:"#ffffff",alpha:0},{pos:.5,color:"#ffffff",alpha:.8},{pos:1,color:"#ffffff",alpha:0}],{stops:e,scatteringG:t,baseOpacity:i}}function Ll(s){const e=document.createElement("canvas");e.width=1,e.height=4096;const t=e.getContext("2d"),i=t.createLinearGradient(0,0,0,4096);for(const r of s.stops){let a=r.color;if(r.color.startsWith("#")){const o=parseInt(r.color.slice(1,3),16),l=parseInt(r.color.slice(3,5),16),c=parseInt(r.color.slice(5,7),16);a=`rgba(${o},${l},${c},${r.alpha})`}i.addColorStop(r.pos,a)}t.fillStyle=i,t.fillRect(0,0,1,4096);const n=new Za(e);return n.minFilter=Ht,n.magFilter=Ht,n.format=Zt,n.colorSpace=Dt,n.flipY=!1,n}function Fg(s){let e=s>>>0;return()=>{e+=1831565813;let t=Math.imul(e^e>>>15,e|1);return t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}}function Mn(s,e,t){let i=s*374761393^e*668265263^t*1442695041;return i=(i^i>>>13)*1274126177,i=i^i>>>16,(i>>>0)/4294967296}function Fl(s,e,t,i){const n=s*t,r=e*t,a=Math.floor(n),o=Math.floor(r);let l=Number.POSITIVE_INFINITY,c=Number.POSITIVE_INFINITY;for(let p=-1;p<=1;p++)for(let g=-1;g<=1;g++){const y=a+g,m=o+p,u=(Mn(y,m,i)-.5)*.75,v=(Mn(y,m,i+97)-.5)*.75,_=y+.5+u,x=m+.5+v,T=n-_,C=r-x,A=Math.sqrt(T*T+C*C);A<l?(c=l,l=A):A<c&&(c=A)}const h=Math.exp(-l*2.1),d=Math.max(0,1-(c-l)*4.2),f=d*d;return .35+.75*h-.42*f}function Ug(s,e,t,i){const n=s*t,r=e*t,a=Math.floor(n),o=Math.floor(r),l=a+1,c=o+1,h=n-a,d=r-o,f=h*h*(3-2*h),p=d*d*(3-2*d),g=Mn(a,o,i),y=Mn(l,o,i),m=Mn(a,c,i),u=Mn(l,c,i),v=g*(1-f)+y*f,_=m*(1-f)+u*f;return v*(1-p)+_*p}function Bg(s,e=256){const t=document.createElement("canvas");t.width=e,t.height=e;const i=t.getContext("2d"),n=i.createImageData(e,e),r=n.data,a=Fg(s);for(let l=0;l<e;l++)for(let c=0;c<e;c++){const h=(l*e+c)*4,d=c/e,f=l/e,p=Fl(d,f,34,s),g=Fl(d,f,51,s+173),y=Ug(d,f,5.5,s+911),m=(a()*2-1)*.06,v=(.62*p+.38*g)*(.9+.18*y)+m,_=Math.max(0,Math.min(255,Math.round(v*255)));r[h]=_,r[h+1]=_,r[h+2]=_,r[h+3]=255}i.putImageData(n,0,0);const o=new Za(t);return o.wrapS=ts,o.wrapT=ts,o.minFilter=Pi,o.magFilter=Ht,o.generateMipmaps=!0,o.needsUpdate=!0,o}function si(s,e,t){let i=(s|0)^(e*374761393|0)^(t*668265263|0);return i=Math.imul(i^i>>>13,1274126177),i^=i>>>16,(i>>>0)/4294967296}function Ul(s,e){const t=Math.cos(s);return new w(t*Math.cos(e),Math.sin(s),t*Math.sin(e))}class Ng{group=new gi;maxFlares=12;sparksPerFlare=6;flareQuality;flareRate;seed;frequencyMode="scaled";brightness=1;events=[];nextEventId=1;nextEventTime=0;arcGeometry;glowGeometry;sparkGeometry;arcMaterial;glowMaterial;sparkMaterial;arcMesh;glowMesh;sparkMesh;arcAnchor;arcTiming;arcShape;arcPhase;glowAnchor;glowTiming;glowShape;glowPhase;sparkAnchor;sparkTiming;sparkVelocity;sparkSize;constructor(e,t,i,n){this.seed=e===0?1:e,this.flareRate=Math.max(0,t),this.flareQuality=n,this.group.name="star-flares";const[r,a,o]=rs(i>0?i:5778),l=new Ae(r,a,o),c=l.clone().lerp(new Ae(1,.98,.9),.55),h=l.clone().lerp(new Ae(1,.62,.32),.35),d=new Yi(1,1,32,8);this.arcGeometry=new Br,this.arcGeometry.index=d.index,this.arcGeometry.setAttribute("position",d.getAttribute("position")),this.arcGeometry.setAttribute("uv",d.getAttribute("uv")),this.arcAnchor=new Float32Array(this.maxFlares*3),this.arcTiming=new Float32Array(this.maxFlares*4),this.arcShape=new Float32Array(this.maxFlares*4),this.arcPhase=new Float32Array(this.maxFlares),this.arcGeometry.setAttribute("a_anchor",new Ft(this.arcAnchor,3)),this.arcGeometry.setAttribute("a_timing",new Ft(this.arcTiming,4)),this.arcGeometry.setAttribute("a_shape",new Ft(this.arcShape,4)),this.arcGeometry.setAttribute("a_phase",new Ft(this.arcPhase,1)),this.arcGeometry.instanceCount=0,this.arcMaterial=new dt({vertexShader:`
#include <common>
#include <logdepthbuf_pars_vertex>
attribute vec3 a_anchor;
attribute vec4 a_timing;
attribute vec4 a_shape;
attribute float a_phase;
varying vec2 vUv;
varying float vLife;
varying float vEnergy;
varying float vSeed;
varying float vFacing;
uniform float u_time;

float flareLife(float t, float start, float duration) {
    float p = clamp((t - start) / max(duration, 1e-6), 0.0, 1.0);
    float riseEnd = 0.15;
    float peakEnd = 0.25;
    float rise = exp(-6.0 * (1.0 - p / riseEnd));
    float peak = 1.0;
    float decay = exp(-4.2 * ((p - peakEnd) / max(1.0 - peakEnd, 1e-5)));
    decay *= smoothstep(1.0, 0.85, p); // Fades completely to zero
    if (p < riseEnd) return rise;
    if (p < peakEnd) return peak;
    return decay;
}

void main() {
    float life = flareLife(u_time, a_timing.x, a_timing.y);
    vec3 n = normalize(a_anchor);
    vec3 ref = abs(n.y) < 0.95 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
    vec3 t = normalize(cross(ref, n));
    vec3 b = normalize(cross(n, t));

    float rot = a_phase * 6.28318530718;
    vec3 tR = normalize(t * cos(rot) + b * sin(rot));
    vec3 bR = normalize(cross(n, tR));

    float x = position.x;
    float y = position.y;
    float arcLen = a_shape.x;
    float arcHeight = a_shape.y * (0.35 + 0.95 * life);
    float baseThickness = a_shape.z * (0.55 + 0.7 * life);
    // Taper: thick at base, thin at apex
    float taper = 1.0 - pow(abs(x * 2.0), 2.0); // Smoothly tapers to 0 at the base (x = ±0.5)
    float thickness = baseThickness * (0.3 + 0.7 * taper);
    float curve = max(0.0, 1.0 - 4.0 * x * x);
    // Slight helical twist along arc length
    float twist = sin(x * 3.14159 * 2.0 + a_phase * 6.28) * 0.03 * arcHeight;

    vec3 center = n * (1.015 + 0.01 * life);
    float tubeN = cos(y * 3.14159);
    float tubeB = sin(y * 3.14159);
    vec3 p = center + tR * (x * arcLen) + bR * (tubeB * thickness + twist) + n * ((curve * arcHeight) + tubeN * thickness * 0.8);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    #include <logdepthbuf_vertex>

    vec4 mvCenter = modelViewMatrix * vec4(center, 1.0);
    vec3 viewN = normalize(mat3(modelViewMatrix) * n);
    vec3 viewDir = normalize(-mvCenter.xyz);
    vFacing = dot(viewN, viewDir);

    vUv = uv;
    vLife = life;
    vEnergy = a_timing.z;
    vSeed = a_timing.w;
}
`,fragmentShader:`
#include <common>
#include <logdepthbuf_pars_fragment>
varying vec2 vUv;
varying float vLife;
varying float vEnergy;
varying float vSeed;
varying float vFacing;
uniform float u_time;
uniform vec3 u_coreColor;
uniform vec3 u_glowColor;
uniform float u_animStrength;
uniform float u_brightness;

void main() {
    #include <logdepthbuf_fragment>
    float edge = smoothstep(0.0, 0.12, vUv.x) * smoothstep(1.0, 0.88, vUv.x);
    float y = abs(vUv.y - 0.5) * 2.0;
    float core = exp(-6.0 * y * y);
    float outer = exp(-1.5 * y * y);
    float tTime = u_time * u_animStrength;
    float turb1 = sin(vUv.x * 34.0 + tTime * 0.07 + vSeed * 5.3) * cos(vUv.y * 19.0 - tTime * 0.05 + vSeed * 2.1);
    float turb2 = sin(vUv.x * 74.0 - tTime * 0.11 + vSeed * 1.3) * cos(vUv.y * 41.0 + tTime * 0.09 + vSeed * 3.8);
    float turb = 0.5 + 0.25 * turb1 + 0.25 * turb2;
    float intensity = (3.0 + 14.0 * vEnergy) * vLife * (0.72 + 0.28 * turb);
    
    // Subtle, physically plausible warm tints
    vec3 tint = mix(vec3(1.0, 0.9, 0.7), vec3(1.0, 0.6, 0.2), fract(vSeed * 3.7));
    vec3 col = mix(u_glowColor, u_coreColor, core);
    col = mix(col, tint, 0.2 * vEnergy);
    float alpha = edge * vLife * (0.25 * outer + 0.85 * core);
    gl_FragColor = vec4(col * intensity * u_brightness, alpha * u_brightness);
}
`,uniforms:{u_time:{value:0},u_coreColor:{value:c},u_glowColor:{value:h},u_animStrength:{value:.75},u_brightness:{value:1}},transparent:!0,blending:$i,side:Ct,depthTest:!0,depthWrite:!1,toneMapped:!1}),this.arcMesh=new at(this.arcGeometry,this.arcMaterial),this.arcMesh.frustumCulled=!1,this.group.add(this.arcMesh);const f=new Yi(1,1,1,1);this.glowGeometry=new Br,this.glowGeometry.index=f.index,this.glowGeometry.setAttribute("position",f.getAttribute("position")),this.glowGeometry.setAttribute("uv",f.getAttribute("uv")),this.glowAnchor=new Float32Array(this.maxFlares*3),this.glowTiming=new Float32Array(this.maxFlares*4),this.glowShape=new Float32Array(this.maxFlares*4),this.glowPhase=new Float32Array(this.maxFlares),this.glowGeometry.setAttribute("a_anchor",new Ft(this.glowAnchor,3)),this.glowGeometry.setAttribute("a_timing",new Ft(this.glowTiming,4)),this.glowGeometry.setAttribute("a_shape",new Ft(this.glowShape,4)),this.glowGeometry.setAttribute("a_phase",new Ft(this.glowPhase,1)),this.glowGeometry.instanceCount=0,this.glowMaterial=new dt({vertexShader:`
#include <common>
#include <logdepthbuf_pars_vertex>
attribute vec3 a_anchor;
attribute vec4 a_timing;
attribute vec4 a_shape;
attribute float a_phase;
varying vec2 vUv;
varying float vLife;
varying float vEnergy;
varying float vSeed;
varying float vFacing;
uniform float u_time;

float flareLife(float t, float start, float duration) {
    float p = clamp((t - start) / max(duration, 1e-6), 0.0, 1.0);
    float riseEnd = 0.15;
    float peakEnd = 0.25;
    float rise = exp(-6.0 * (1.0 - p / riseEnd));
    float peak = 1.0;
    float decay = exp(-4.2 * ((p - peakEnd) / max(1.0 - peakEnd, 1e-5)));
    decay *= smoothstep(1.0, 0.85, p); // Fades completely to zero
    if (p < riseEnd) return rise;
    if (p < peakEnd) return peak;
    return decay;
}

void main() {
    float life = flareLife(u_time, a_timing.x, a_timing.y);
    vec3 n = normalize(a_anchor);
    vec3 center = n * (1.02 + 0.025 * life);
    vec4 mvCenter = modelViewMatrix * vec4(center, 1.0);

    float size = a_shape.x * (2.4 + 1.8 * a_timing.z) * (0.55 + 0.55 * life);
    vec2 wobble = vec2(
        sin(u_time * 0.08 + a_phase * 10.0),
        cos(u_time * 0.06 + a_phase * 7.0)
    ) * 0.05 * size;
    mvCenter.xy += position.xy * size + wobble;
    gl_Position = projectionMatrix * mvCenter;

    vec3 viewN = normalize(mat3(modelViewMatrix) * n);
    vec3 viewDir = normalize(-mvCenter.xyz);
    vFacing = dot(viewN, viewDir);

    vUv = uv;
    vLife = life;
    vEnergy = a_timing.z;
    vSeed = a_timing.w;
}
`,fragmentShader:`
#include <common>
#include <logdepthbuf_pars_fragment>
varying vec2 vUv;
varying float vLife;
varying float vEnergy;
varying float vSeed;
varying float vFacing;
uniform float u_time;
uniform vec3 u_coreColor;
uniform vec3 u_glowColor;
uniform float u_animStrength;
uniform float u_brightness;

void main() {
    #include <logdepthbuf_fragment>
    vec2 p = vUv - 0.5;
    float r = length(p) * 2.0;
    float core = exp(-8.0 * r * r);
    float halo = exp(-2.0 * r * r);
    float tTime = u_time * u_animStrength;
    float plasma1 = sin(24.0 * p.x + tTime * 0.09 + vSeed * 1.7) * cos(18.0 * p.y - tTime * 0.07 + vSeed * 2.3);
    float plasma2 = sin(54.0 * p.x - tTime * 0.14 + vSeed * 4.1) * cos(38.0 * p.y + tTime * 0.11 + vSeed * 0.9);
    float plasma = 0.5 + 0.25 * plasma1 + 0.25 * plasma2;
    float intensity = (1.8 + 8.0 * vEnergy) * vLife * (0.8 + 0.2 * plasma);
    
    vec3 tint = mix(vec3(1.0, 0.9, 0.7), vec3(1.0, 0.6, 0.2), fract(vSeed * 3.7));
    vec3 col = mix(u_glowColor, u_coreColor, core);
    col = mix(col, tint, 0.2 * vEnergy);
    float front = smoothstep(-0.4, 0.0, vFacing);
    float alpha = vLife * (0.4 * halo + 0.8 * core) * (1.0 - smoothstep(0.85, 1.0, r)) * front;
    gl_FragColor = vec4(col * intensity * u_brightness, alpha * u_brightness);
}
`,uniforms:{u_time:{value:0},u_coreColor:{value:c},u_glowColor:{value:h},u_animStrength:{value:.75},u_brightness:{value:1}},transparent:!0,blending:$i,side:Ct,depthTest:!1,depthWrite:!1,toneMapped:!1}),this.glowMesh=new at(this.glowGeometry,this.glowMaterial),this.glowMesh.frustumCulled=!1,this.group.add(this.glowMesh);const p=new Yi(1,1,1,1);this.sparkGeometry=new Br,this.sparkGeometry.index=p.index,this.sparkGeometry.setAttribute("position",p.getAttribute("position")),this.sparkGeometry.setAttribute("uv",p.getAttribute("uv"));const g=this.maxFlares*this.sparksPerFlare;this.sparkAnchor=new Float32Array(g*3),this.sparkTiming=new Float32Array(g*4),this.sparkVelocity=new Float32Array(g*3),this.sparkSize=new Float32Array(g),this.sparkGeometry.setAttribute("a_anchor",new Ft(this.sparkAnchor,3)),this.sparkGeometry.setAttribute("a_timing",new Ft(this.sparkTiming,4)),this.sparkGeometry.setAttribute("a_velocity",new Ft(this.sparkVelocity,3)),this.sparkGeometry.setAttribute("a_size",new Ft(this.sparkSize,1)),this.sparkGeometry.instanceCount=0,this.sparkMaterial=new dt({vertexShader:`
#include <common>
#include <logdepthbuf_pars_vertex>
attribute vec3 a_anchor;
attribute vec4 a_timing;
attribute vec3 a_velocity;
attribute float a_size;
varying vec2 vUv;
varying float vLife;
varying float vEnergy;
varying float vFacing;
uniform float u_time;

float flareLife(float t, float start, float duration) {
    float p = clamp((t - start) / max(duration, 1e-6), 0.0, 1.0);
    float riseEnd = 0.15;
    float peakEnd = 0.25;
    float rise = exp(-6.0 * (1.0 - p / riseEnd));
    float peak = 1.0;
    float decay = exp(-4.2 * ((p - peakEnd) / max(1.0 - peakEnd, 1e-5)));
    decay *= smoothstep(1.0, 0.85, p); // Fades completely to zero
    if (p < riseEnd) return rise;
    if (p < peakEnd) return peak;
    return decay;
}

void main() {
    float life = flareLife(u_time, a_timing.x, a_timing.y);
    float age = clamp((u_time - a_timing.x) / max(a_timing.y, 1e-6), 0.0, 1.0);
    vec3 n = normalize(a_anchor);
    vec3 center = n * (1.025 + 0.09 * age) + a_velocity * (0.35 * age);

    vec4 mvCenter = modelViewMatrix * vec4(center, 1.0);
    float size = a_size * (1.0 - age) * (0.4 + 0.8 * a_timing.z);
    mvCenter.xy += position.xy * size;
    gl_Position = projectionMatrix * mvCenter;
    #include <logdepthbuf_vertex>

    vec3 viewN = normalize(mat3(modelViewMatrix) * n);
    vec3 viewDir = normalize(-mvCenter.xyz);
    vFacing = dot(viewN, viewDir);

    vUv = uv;
    vLife = life;
    vEnergy = a_timing.z;
}
`,fragmentShader:`
#include <common>
#include <logdepthbuf_pars_fragment>
varying vec2 vUv;
varying float vLife;
varying float vEnergy;
varying float vFacing;
uniform vec3 u_coreColor;

void main() {
    #include <logdepthbuf_fragment>
    vec2 p = vUv - 0.5;
    float r = length(p) * 2.0;
    float core = exp(-10.0 * r * r);
    float front = smoothstep(-0.4, 0.0, vFacing);
    float alpha = vLife * core * (1.0 - smoothstep(0.85, 1.0, r)) * front;
    vec3 tint = mix(vec3(1.0, 0.9, 0.7), vec3(1.0, 0.6, 0.2), fract(vEnergy * 3.7));
    vec3 col = mix(u_coreColor, tint, 0.3) * (2.2 + 4.5 * vEnergy);
    gl_FragColor = vec4(col, alpha);
}
`,uniforms:{u_time:{value:0},u_coreColor:{value:c}},transparent:!0,blending:$i,side:Ct,depthTest:!1,depthWrite:!1,toneMapped:!1}),this.sparkMesh=new at(this.sparkGeometry,this.sparkMaterial),this.sparkMesh.frustumCulled=!1,this.group.add(this.sparkMesh),this.setQuality(n),this.scheduleNextEvent(0)}setQuality(e){this.flareQuality=e,this.arcMesh.visible=e==="High"||e==="Ultra",this.glowMesh.visible=e!=="Off",this.sparkMesh.visible=e==="Ultra";const t=e==="Low"?.3:e==="High"?.75:e==="Ultra"?1:0;this.arcMaterial.uniforms.u_animStrength.value=t,this.glowMaterial.uniforms.u_animStrength.value=t;const i=this.maxActiveForQuality();this.events.length>i&&(this.events.splice(0,this.events.length-i),this.syncBuffers())}fixedFlareRate=2;setFrequencyMode(e){this.frequencyMode=e}getFrequencyMode(){return this.frequencyMode}setFixedFlareRate(e){this.fixedFlareRate!==e&&(this.fixedFlareRate=e,this.frequencyMode==="fixed"&&this.scheduleNextEvent(this.currentVisualTime))}setBrightness(e){this.brightness=Math.max(0,Math.min(3,e));const t=this.brightness;this.arcMaterial.uniforms.u_brightness.value=t,this.glowMaterial.uniforms.u_brightness.value=t}getBrightness(){return this.brightness}setFlareRate(e){this.flareRate=Math.max(0,e)}currentVisualTime=0;lastSimTime=0;update(e,t){const i=e-this.lastSimTime;this.lastSimTime=e;let n=0;if(this.frequencyMode==="fixed"?n=t:(n=Math.max(0,i),n>31536e5&&(n=0)),this.currentVisualTime+=n,this.arcMaterial.uniforms.u_time.value=this.currentVisualTime,this.glowMaterial.uniforms.u_time.value=this.currentVisualTime,this.sparkMaterial.uniforms.u_time.value=this.currentVisualTime,this.flareQuality==="Off")return;let r=0;for(;this.currentVisualTime>=this.nextEventTime&&r<6;)this.spawnEvent(this.nextEventTime),r++;const a=this.events.length;this.events=this.events.filter(o=>this.currentVisualTime<=o.start+o.duration),this.events.length!==a&&this.syncBuffers()}dispose(){this.arcGeometry.dispose(),this.glowGeometry.dispose(),this.sparkGeometry.dispose(),this.arcMaterial.dispose(),this.glowMaterial.dispose(),this.sparkMaterial.dispose()}maxActiveForQuality(){return this.flareQuality==="Off"?0:this.flareQuality==="Low"?2:this.flareQuality==="High"?5:this.flareQuality==="Ultra"?8:0}effectiveRate(){return this.flareQuality==="Off"?0:this.frequencyMode==="fixed"?this.fixedFlareRate<=0?0:this.fixedFlareRate/100:Math.max(this.flareRate,1e-6)}spawnEvent(e){const t=this.maxActiveForQuality();if(t<=0){this.scheduleNextEvent(e);return}const i=this.nextEventId++,n=.45+1.85*Math.pow(si(this.seed,i,1),1.35),r=this.flareQuality==="Low"?42:this.flareQuality==="High"?34:28,a=(this.frequencyMode==="fixed"?r:3600)*(.65+.9*si(this.seed,i,2)),o=(si(this.seed,i,3)*2-1)*.9,l=si(this.seed,i,4)*Math.PI*2,c=.16+.46*n,h=si(this.seed,i,5),d={id:i,start:e,duration:a,energy:n,lat:o,lon:l,size:c,phase:h};this.events.length>=t&&this.events.shift(),this.events.push(d),this.syncBuffers(),this.scheduleNextEvent(e)}scheduleNextEvent(e){const t=this.effectiveRate();if(t<=0){this.nextEventTime=Number.POSITIVE_INFINITY;return}const i=Math.max(1e-6,1-si(this.seed,this.nextEventId,9)),n=-Math.log(i)/t;this.nextEventTime=e+n}syncBuffers(){const e=this.maxActiveForQuality(),t=Math.min(this.events.length,e);for(let d=0;d<t;d++){const f=this.events[this.events.length-t+d],p=Ul(f.lat,f.lon);this.arcAnchor[d*3]=p.x,this.arcAnchor[d*3+1]=p.y,this.arcAnchor[d*3+2]=p.z,this.arcTiming[d*4]=f.start,this.arcTiming[d*4+1]=f.duration,this.arcTiming[d*4+2]=f.energy,this.arcTiming[d*4+3]=f.id,this.arcShape[d*4]=f.size,this.arcShape[d*4+1]=f.size*.55,this.arcShape[d*4+2]=f.size*.18,this.arcShape[d*4+3]=0,this.arcPhase[d]=f.phase,this.glowAnchor[d*3]=p.x,this.glowAnchor[d*3+1]=p.y,this.glowAnchor[d*3+2]=p.z,this.glowTiming[d*4]=f.start,this.glowTiming[d*4+1]=f.duration,this.glowTiming[d*4+2]=f.energy,this.glowTiming[d*4+3]=f.id,this.glowShape[d*4]=f.size,this.glowShape[d*4+1]=f.size,this.glowShape[d*4+2]=f.size,this.glowShape[d*4+3]=0,this.glowPhase[d]=f.phase}const i=this.arcGeometry.getAttribute("a_anchor"),n=this.arcGeometry.getAttribute("a_timing"),r=this.arcGeometry.getAttribute("a_shape"),a=this.arcGeometry.getAttribute("a_phase");i.needsUpdate=!0,n.needsUpdate=!0,r.needsUpdate=!0,a.needsUpdate=!0,this.arcGeometry.instanceCount=t;const o=this.glowGeometry.getAttribute("a_anchor"),l=this.glowGeometry.getAttribute("a_timing"),c=this.glowGeometry.getAttribute("a_shape"),h=this.glowGeometry.getAttribute("a_phase");if(o.needsUpdate=!0,l.needsUpdate=!0,c.needsUpdate=!0,h.needsUpdate=!0,this.glowGeometry.instanceCount=t,this.flareQuality==="Ultra"){let d=0;for(let m=0;m<t;m++){const u=this.events[this.events.length-t+m],v=Ul(u.lat,u.lon);for(let _=0;_<this.sparksPerFlare;_++){const x=d,T=si(this.seed,u.id,20+_*3),C=si(this.seed,u.id,21+_*3),A=si(this.seed,u.id,22+_*3),M=(Math.abs(v.y)<.95?new w(0,1,0):new w(1,0,0)).clone().cross(v).normalize(),S=v.clone().cross(M).normalize(),I=T*Math.PI*2,F=.25+.6*C,N=v.clone().multiplyScalar(.8+.8*A).add(M.clone().multiplyScalar(Math.cos(I)*F)).add(S.clone().multiplyScalar(Math.sin(I)*F)).normalize();this.sparkAnchor[x*3]=v.x,this.sparkAnchor[x*3+1]=v.y,this.sparkAnchor[x*3+2]=v.z,this.sparkTiming[x*4]=u.start,this.sparkTiming[x*4+1]=u.duration,this.sparkTiming[x*4+2]=u.energy,this.sparkTiming[x*4+3]=u.id,this.sparkVelocity[x*3]=N.x,this.sparkVelocity[x*3+1]=N.y,this.sparkVelocity[x*3+2]=N.z,this.sparkSize[x]=.06+.08*si(this.seed,u.id,50+_),d++}}const f=this.sparkGeometry.getAttribute("a_anchor"),p=this.sparkGeometry.getAttribute("a_timing"),g=this.sparkGeometry.getAttribute("a_velocity"),y=this.sparkGeometry.getAttribute("a_size");f.needsUpdate=!0,p.needsUpdate=!0,g.needsUpdate=!0,y.needsUpdate=!0,this.sparkGeometry.instanceCount=d}else this.sparkGeometry.instanceCount=0}}function Og(s){if(s.type==="star"||s.rings||s.atmosphere&&s.atmosphere.height>0)return!1;const e=s.name.toLowerCase();return!["mercury","venus","earth","moon","mars","jupiter","saturn","uranus","neptune"].includes(e)}class Bl{scene;solarSystemRoot;bodies=new Map;lightSourceManager=new Rg;shadowCasterManager=new Cg;instancedMeshClose=null;instancedMeshFar=null;genericBodyIds=[];dummyMatrix=new Ke;dummyColor=new Ae;gridGroup=null;gridSpacing=Ze;gridSize=40;gridXYVisible=!1;gridXZVisible=!1;gridYZVisible=!1;gridBuildOrigin={x:0,y:0,z:0};renderScale=1;sphereSegments={width:16,height:8};dummyPosition=new w;dummyScale=new w;dummyQuaternion=new Un;dummyProjectVec=new w;starRenderOptions={granulationEnabled:!0,starspotsEnabled:!1,flareQuality:"Low"};ringQuality="HighQualityClose";shadowQuality="Penumbra";maxTrailPoints=100;currentNumTrails=0;globalTrailGeometry;globalTrailMesh;globalTrailMaterial;trailPositionsHigh;trailPositionsLow;trailColors;trailIndices;globalTrailHead=0;trailOffsets=new Map;trailInitialized=new Set;fullBufferUpdateNeeded=!1;nextTrailOffset=0;TRAIL_SAMPLE_INTERVAL=5;frameCount=0;lastOrigin={x:0,y:0,z:0};axisLines=new Map;showAxisLinesFlag=!1;refPlanes=new Map;showRefPlaneFlag=!1;refLines=new Map;showRefLineFlag=!1;refPoints=new Map;showRefPointFlag=!1;ghostMesh=null;ghostAtmoMesh=null;ghostVisible=!1;labelContainer;constructor(e){this.scene=e,this.solarSystemRoot=new gi,this.solarSystemRoot.rotation.x=-Math.PI/2,this.scene.add(this.solarSystemRoot),this.labelContainer=document.createElement("div"),this.labelContainer.id="body-label-container",this.labelContainer.style.position="absolute",this.labelContainer.style.top="0",this.labelContainer.style.left="0",this.labelContainer.style.width="100%",this.labelContainer.style.height="100%",this.labelContainer.style.pointerEvents="none",this.labelContainer.style.overflow="hidden",this.labelContainer.style.zIndex="10",document.getElementById("canvas-container")?.appendChild(this.labelContainer);const t=new Kn({roughness:.8,metalness:.1}),i=new ir(1,fg);this.instancedMeshClose=new Oo(i,t,5e3),this.instancedMeshClose.instanceMatrix.setUsage(us),this.instancedMeshClose.instanceColor&&this.instancedMeshClose.instanceColor.setUsage(us),this.instancedMeshClose.count=0,this.instancedMeshClose.frustumCulled=!1,this.solarSystemRoot.add(this.instancedMeshClose);const n=new ir(1,pg);this.instancedMeshFar=new Oo(n,t,5e3),this.instancedMeshFar.instanceMatrix.setUsage(us),this.instancedMeshFar.instanceColor&&this.instancedMeshFar.instanceColor.setUsage(us),this.instancedMeshFar.count=0,this.instancedMeshFar.frustumCulled=!1,this.solarSystemRoot.add(this.instancedMeshFar),this.trailPositionsHigh=new Float32Array(0),this.trailPositionsLow=new Float32Array(0),this.trailColors=new Float32Array(0),this.trailIndices=new Uint32Array(0),this.globalTrailGeometry=new vt,this.globalTrailGeometry.setAttribute("positionHigh",new lt(this.trailPositionsHigh,3)),this.globalTrailGeometry.setAttribute("positionLow",new lt(this.trailPositionsLow,3)),this.globalTrailGeometry.setAttribute("color",new lt(this.trailColors,3)),this.globalTrailGeometry.setIndex(new lt(this.trailIndices,1)),this.globalTrailGeometry.setDrawRange(0,0),this.globalTrailMaterial=new es({vertexColors:!0,transparent:!0,opacity:.6}),this.globalTrailMaterial.onBeforeCompile=r=>{r.uniforms.u_originHigh={value:new w},r.uniforms.u_originLow={value:new w},this.globalTrailMaterial.userData.shader=r,r.vertexShader=`uniform vec3 u_originHigh;
uniform vec3 u_originLow;
attribute vec3 positionHigh;
attribute vec3 positionLow;
`+r.vertexShader,r.vertexShader=r.vertexShader.replace("#include <begin_vertex>","vec3 transformed = (positionHigh - u_originHigh) + (positionLow - u_originLow);")},this.globalTrailMesh=new Lr(this.globalTrailGeometry,this.globalTrailMaterial),this.globalTrailMesh.frustumCulled=!1,this.solarSystemRoot.add(this.globalTrailMesh)}setRenderScale(e){!Number.isFinite(e)||e<=0||(this.renderScale=e,this.updateBodySizes())}getRenderScale(){return this.renderScale}setShadowQuality(e){this.shadowQuality=e}setStarRenderOptions(e){const t=typeof e.granulationEnabled=="boolean"?e.granulationEnabled:this.starRenderOptions.granulationEnabled,i=typeof e.starspotsEnabled=="boolean"?e.starspotsEnabled:this.starRenderOptions.starspotsEnabled,n=e.flareQuality==="Off"||e.flareQuality==="Low"||e.flareQuality==="High"||e.flareQuality==="Ultra"?e.flareQuality:this.starRenderOptions.flareQuality;if(!(t===this.starRenderOptions.granulationEnabled&&i===this.starRenderOptions.starspotsEnabled&&n===this.starRenderOptions.flareQuality)){this.starRenderOptions.granulationEnabled=t,this.starRenderOptions.starspotsEnabled=i,this.starRenderOptions.flareQuality=n;for(const r of this.bodies.values())r.setGranulationEnabled(t),r.setStarspotsEnabled(i),r.setFlareQuality(n)}}setFlareFrequencyMode(e){for(const t of this.bodies.values())t.setFlareFrequencyMode(e)}setFixedFlareRate(e){for(const t of this.bodies.values())t.setFixedFlareRate(e)}realisticTexturesEnabled=!0;setRealisticTexturesEnabled(e){this.realisticTexturesEnabled=e;for(const t of this.bodies.values())t.applyRealisticTextures(e)}setRingQuality(e){this.ringQuality=e}setFlareBrightness(e){for(const t of this.bodies.values())t.setFlareBrightness(e)}updateBodySizes(){for(const[e,t]of this.bodies){const i=t.realRadius*this.renderScale;t.setScale(i)}}addBody(e){let t;Og(e)&&this.instancedMeshClose&&this.instancedMeshFar&&(t=this.genericBodyIds.length,this.genericBodyIds.push(e.id),this.instancedMeshClose.count=this.genericBodyIds.length,this.instancedMeshFar.count=this.genericBodyIds.length);const i=new Rt(e,this.sphereSegments.width,this.sphereSegments.height,this.starRenderOptions,t);if(i.applyRealisticTextures(this.realisticTexturesEnabled),t!==void 0&&this.instancedMeshClose&&this.instancedMeshFar&&i.baseColor){const M=new Ae(i.baseColor);this.instancedMeshClose.setColorAt(t,M),this.instancedMeshFar.setColorAt(t,M),this.instancedMeshClose.instanceColor&&(this.instancedMeshClose.instanceColor.needsUpdate=!0),this.instancedMeshFar.instanceColor&&(this.instancedMeshFar.instanceColor.needsUpdate=!0)}i.applyRealisticTextures(this.realisticTexturesEnabled),this.bodies.set(e.id,i),this.solarSystemRoot.add(i.group);const n=e.radius*this.renderScale;if(i.setScale(n),e.type==="star"){const M=e.effectiveTemperature??5778,[S,I,F]=rs(M>0?M:5778),N=new Ae(S,I,F),W=e.luminosity&&e.luminosity>0?e.luminosity/Zs:1,X=Math.min(10,Math.max(.5,1.5+Math.log10(Math.max(W,.001))))*Ze*Ze,j=new bu(N,X,0,2);i.group.add(j),this.lightSourceManager.registerSource(e.id,{id:e.id,position:new w,color:N,luminosity:W,radius:e.radius,temperature:M})}if(this.shadowCasterManager.registerCaster(e.id,{id:e.id,position:new w,radius:e.radius}),e.type!=="star"){const M=this.nextTrailOffset++;this.trailOffsets.set(e.id,M)}const r=this.createLabelElement(e.name,e.type);this.bodyLabels.set(e.id,{el:r,type:e.type,visible:!1,wasOffScreen:!1}),this.updateLabelVisibility(e.id);const a=new w(0,1,0),o=e.radius*this.renderScale,l=o*3,c=e.type==="star"?16755200:4513279,h=new wu(a,new w(0,0,0),l,c,l*.2,l*.1);h.visible=this.showAxisLinesFlag,i.group.add(h),this.axisLines.set(e.id,h);const d=o*2,f=new ar(o*.1,d,48),p=new Tn({color:4491468,transparent:!0,opacity:.12,side:Ct,depthWrite:!1}),g=new at(f,p);g.rotation.x=-Math.PI/2,g.visible=this.showRefPlaneFlag,i.group.add(g),this.refPlanes.set(e.id,g);const y=new w(1,0,0),m=32,u=[];for(let M=0;M<=m;M++){const S=Math.PI*(1-M/m),I=Math.sin(S),F=Math.cos(S);u.push(a.clone().multiplyScalar(F*1).add(y.clone().multiplyScalar(I*1)))}const v=new vt().setFromPoints(u),_=new es({color:16737860}),x=new tr(v,_);x.visible=this.showRefLineFlag,i.mesh.add(x),this.refLines.set(e.id,x);const T=.08,C=new ti(T,8,6),A=new Tn({color:16724787}),P=new at(C,A);P.position.copy(y.clone().multiplyScalar(1)),P.visible=this.showRefPointFlag,i.mesh.add(P),this.refPoints.set(e.id,P)}setSphereSegments(e,t){const i=Math.max(8,Math.round(e)),n=Math.max(6,Math.round(t));if(!(i===this.sphereSegments.width&&n===this.sphereSegments.height)){this.sphereSegments={width:i,height:n};for(const r of this.bodies.values())r.setSegments(i,n)}}createLabelElement(e,t){const i=document.createElement("div");return i.className=`body-label label-${t}`,i.textContent=e,this.labelContainer.appendChild(i),i}removeBody(e){const t=this.bodies.get(e);t&&(t.isInstanced&&this.instancedMeshClose&&this.instancedMeshFar&&(this.dummyMatrix.makeScale(0,0,0),this.instancedMeshClose.setMatrixAt(t.instanceId,this.dummyMatrix),this.instancedMeshClose.instanceMatrix.needsUpdate=!0,this.instancedMeshFar.setMatrixAt(t.instanceId,this.dummyMatrix),this.instancedMeshFar.instanceMatrix.needsUpdate=!0),t.type==="star"&&this.lightSourceManager.removeSource(e),this.shadowCasterManager.removeCaster(e),this.scene.remove(t.group),t.dispose(),this.bodies.delete(e));const i=this.trailOffsets.get(e);if(i!==void 0){const r=i*this.maxTrailPoints*2;for(let a=0;a<this.maxTrailPoints*2;a++)this.trailIndices[r+a]=0;this.trailOffsets.delete(e),this.globalTrailGeometry.index.needsUpdate=!0}const n=this.bodyLabels.get(e);n&&(n.el.parentNode&&n.el.parentNode.removeChild(n.el),this.bodyLabels.delete(e))}update(e,t,i){this.frameCount++;const n=this.frameCount%this.TRAIL_SAMPLE_INTERVAL===0;if(this.lastOrigin=t,this.currentNumTrails!==this.nextTrailOffset&&(this.currentNumTrails=this.nextTrailOffset,this.reallocateTrailBuffers()),this.globalTrailMesh&&(this.globalTrailMesh.visible=this.showOrbitTrails&&this.currentNumTrails>0&&this.trailInitialized.size>=this.currentNumTrails),this.globalTrailMaterial.userData.shader){const f=Math.fround(t.x),p=Math.fround(t.y),g=Math.fround(t.z);this.globalTrailMaterial.userData.shader.uniforms.u_originHigh.value.set(f,p,g),this.globalTrailMaterial.userData.shader.uniforms.u_originLow.value.set(t.x-f,t.y-p,t.z-g)}if(this.gridGroup&&this.gridSpacing>0){const f=t.x-this.gridBuildOrigin.x,p=t.y-this.gridBuildOrigin.y,g=t.z-this.gridBuildOrigin.z,y=1e11;Math.abs(f)>y||Math.abs(p)>y||Math.abs(g)>y?this.rebuildGrid(t):this.gridGroup.position.set(-f,-p,-g)}let r=0;for(const[f,p]of this.bodies){if(r*3+2<e.length){const g=e[r*3]-t.x,y=e[r*3+1]-t.y,m=e[r*3+2]-t.z;p.type==="star"&&this.lightSourceManager.updatePosition(f,g,y,m),this.shadowCasterManager.updatePosition(f,g,y,m)}r++}let a=!1;const o=i.position.x,l=-i.position.z,c=i.position.y,h=new w(o,l,c);let d=0;for(const[f,p]of this.bodies){if(d*3+2<e.length){const g=e[d*3],y=e[d*3+1],m=e[d*3+2],u=g-t.x,v=y-t.y,_=m-t.z;p.group.position.set(u,v,_);const x=o-u,T=l-v,C=c-_,A=Math.sqrt(x*x+T*T+C*C);p.isInstanced&&this.instancedMeshClose&&this.instancedMeshFar&&this.updateBodyMatrix(p,u,v,_,A)&&(a=!0),this.updateBodyLOD(p,A,h,u,v,_,this.lightSourceManager),this.updateBodyLabel(f,u,v,_,i),this.updateBodyTrail(f,n,g,y,m)}d++}if(a&&this.instancedMeshClose&&this.instancedMeshFar&&(this.instancedMeshClose.instanceMatrix.needsUpdate=!0,this.instancedMeshFar.instanceMatrix.needsUpdate=!0),n&&this.currentNumTrails>0){const f=this.globalTrailHead,p=this.currentNumTrails,g=(f+1)%this.maxTrailPoints,y=(f-1+this.maxTrailPoints)%this.maxTrailPoints,m=y*p*2;for(let T=0;T<p;T++)this.trailIndices[m+T*2+1]=f*p+T;const u=f*p*2;for(let T=0;T<p;T++)this.trailIndices[u+T*2+1]=f*p+T;this.globalTrailHead=g;const v=this.globalTrailGeometry.attributes.positionHigh,_=this.globalTrailGeometry.attributes.positionLow,x=this.globalTrailGeometry.index;this.fullBufferUpdateNeeded?(v.clearUpdateRanges(),v.addUpdateRange(0,v.array.length),v.needsUpdate=!0,_.clearUpdateRanges(),_.addUpdateRange(0,_.array.length),_.needsUpdate=!0,x.clearUpdateRanges(),x.addUpdateRange(0,x.array.length),x.needsUpdate=!0,this.fullBufferUpdateNeeded=!1):(v.clearUpdateRanges(),v.addUpdateRange(f*p*3,p*3),v.needsUpdate=!0,_.clearUpdateRanges(),_.addUpdateRange(f*p*3,p*3),_.needsUpdate=!0,x.clearUpdateRanges(),f===0?x.addUpdateRange(0,x.array.length):x.addUpdateRange(y*p*2,p*4),x.needsUpdate=!0)}}updateBodyMatrix(e,t,i,n,r){if(!this.instancedMeshClose||!this.instancedMeshFar)return!1;const a=e.realRadius*this.renderScale;this.dummyQuaternion.copy(e.group.quaternion).multiply(e.mesh.quaternion),this.dummyPosition.set(t,i,n);const o=e;return r<a*gg?(e.heroMesh||e.createHeroMesh(),e.heroMesh&&(e.heroMesh.visible=!0),this.dummyScale.set(0,0,0),this.dummyMatrix.compose(this.dummyPosition,this.dummyQuaternion,this.dummyScale),this.instancedMeshClose.setMatrixAt(e.instanceId,this.dummyMatrix),this.instancedMeshFar.setMatrixAt(e.instanceId,this.dummyMatrix)):r<a*mg?(e.heroMesh&&(e.heroMesh.visible=!1),this.dummyScale.set(a,a*(1-o.oblateness),a),this.dummyMatrix.compose(this.dummyPosition,this.dummyQuaternion,this.dummyScale),this.instancedMeshClose.setMatrixAt(e.instanceId,this.dummyMatrix),this.dummyScale.set(0,0,0),this.dummyMatrix.compose(this.dummyPosition,this.dummyQuaternion,this.dummyScale),this.instancedMeshFar.setMatrixAt(e.instanceId,this.dummyMatrix)):(e.heroMesh&&(e.heroMesh.visible=!1),this.dummyScale.set(a,a*(1-o.oblateness),a),this.dummyMatrix.compose(this.dummyPosition,this.dummyQuaternion,this.dummyScale),this.instancedMeshFar.setMatrixAt(e.instanceId,this.dummyMatrix),this.dummyScale.set(0,0,0),this.dummyMatrix.compose(this.dummyPosition,this.dummyQuaternion,this.dummyScale),this.instancedMeshClose.setMatrixAt(e.instanceId,this.dummyMatrix)),!0}updateBodyLOD(e,t,i,n,r,a,o){e.updateRingQuality(this.ringQuality,t,this.renderScale);const l=o.getSignificantSources(e.group.position,4);let c=[],h=0;this.shadowQuality!=="Off"&&e.mesh&&(c=this.shadowCasterManager.getSignificantCasters(e.mesh.userData.bodyId,e.group.position,l,o.resultCount,4),h=this.shadowCasterManager.resultCount),e.updateLighting(l,o.resultCount,c,h,this.shadowQuality,e.group.position,i,this.renderScale);const d=e.realRadius*this.renderScale,f=t/d;let p=e.currentLodTier;if(p==="ultra"?f>Cl*Xr&&(p="nearUltra"):p==="nearUltra"?f<Cl?p="ultra":f>Al*Xr&&(p="medium"):p==="medium"?f<Al?p="nearUltra":f>Pl*Xr&&(p="base"):f<Pl&&(p="medium"),p!==e.currentLodTier)switch(e.currentLodTier=p,p){case"ultra":e.setSegments(wl.w,wl.h);break;case"nearUltra":e.setSegments(Tl.w,Tl.h);break;case"medium":e.setSegments(Rl.w,Rl.h);break;case"base":e.setSegments(this.sphereSegments.width,this.sphereSegments.height);break}}updateBodyLabel(e,t,i,n,r){const a=this.bodyLabels.get(e);if(a&&a.visible){const o=this.bodies.get(e),l=o?o.realRadius*this.renderScale:Ze*.01,c=Math.max(l*1.5,Ze*1e-4);this.dummyProjectVec.set(t,n,-i),this.dummyProjectVec.y+=c;const h=this.dummyProjectVec.project(r);if(h.z<0||h.z>1||Math.abs(h.x)>1.05||Math.abs(h.y)>1.05)a.wasOffScreen||(a.el.style.transform="translate(-10000px, -10000px)",a.wasOffScreen=!0);else{const f=(h.x*.5+.5)*window.innerWidth,p=(h.y*-.5+.5)*window.innerHeight;a.el.style.transform=`translate(-50%, -100%) translate(${f}px, ${p}px)`,a.wasOffScreen=!1}}}updateBodyTrail(e,t,i,n,r){if(!t||!this.trailOffsets.has(e))return;const a=this.trailOffsets.get(e),o=this.globalTrailHead,l=this.currentNumTrails,c=o*l+a,h=Math.fround(i),d=Math.fround(n),f=Math.fround(r);if(this.trailInitialized.has(e))this.trailPositionsHigh[c*3+0]=h,this.trailPositionsHigh[c*3+1]=d,this.trailPositionsHigh[c*3+2]=f,this.trailPositionsLow[c*3+0]=i-h,this.trailPositionsLow[c*3+1]=n-d,this.trailPositionsLow[c*3+2]=r-f;else{this.trailInitialized.add(e),this.fullBufferUpdateNeeded=!0;for(let p=0;p<this.maxTrailPoints;p++){const g=p*l+a;this.trailPositionsHigh[g*3+0]=h,this.trailPositionsHigh[g*3+1]=d,this.trailPositionsHigh[g*3+2]=f,this.trailPositionsLow[g*3+0]=i-h,this.trailPositionsLow[g*3+1]=n-d,this.trailPositionsLow[g*3+2]=r-f}}}updateBodyRingProfile(e,t){const i=this.bodies.get(e);i&&i.updateRingProfile(t)}getBodyRingProfile(e){const t=this.bodies.get(e);if(t&&t.ringMesh)return t.ringMesh.userData.profile}showAtmospheres=!1;showOrbitTrails=!0;showStarLabels=!1;showPlanetLabels=!1;showMoonLabels=!1;bodyLabels=new Map;updateLabelVisibility(e){const t=this.bodyLabels.get(e);if(!t)return;let i=!1;t.type==="star"?i=this.showStarLabels:t.type==="planet"?i=this.showPlanetLabels:t.type==="moon"&&(i=this.showMoonLabels),t.visible=i,t.el.style.display=i?"block":"none",i||(t.wasOffScreen=!1)}setShowAxisLines(e){this.showAxisLinesFlag=e;for(const t of this.axisLines.values())t.visible=e}setShowRefPlane(e){this.showRefPlaneFlag=e;for(const t of this.refPlanes.values())t.visible=e}setShowRefLine(e){this.showRefLineFlag=e;for(const t of this.refLines.values())t.visible=e}setShowRefPoint(e){this.showRefPointFlag=e;for(const t of this.refPoints.values())t.visible=e}setShowOrbitTrails(e){this.showOrbitTrails=e,this.globalTrailMesh&&(this.globalTrailMesh.visible=e)}setShowAtmospheres(e){this.showAtmospheres=e;for(const t of this.bodies.values())t.setAtmosphereVisibility(e);this.ghostAtmoMesh&&(this.ghostAtmoMesh.visible=e&&this.ghostVisible)}setShowStarLabels(e){this.showStarLabels=e;for(const t of this.bodyLabels.keys())this.updateLabelVisibility(t)}setShowPlanetLabels(e){this.showPlanetLabels=e;for(const t of this.bodyLabels.keys())this.updateLabelVisibility(t)}setShowMoonLabels(e){this.showMoonLabels=e;for(const t of this.bodyLabels.keys())this.updateLabelVisibility(t)}setMaxTrailPoints(e){e!==this.maxTrailPoints&&(this.maxTrailPoints=e,this.reallocateTrailBuffers())}reallocateTrailBuffers(){if(!this.globalTrailGeometry)return;const e=this.currentNumTrails;if(e===0){this.globalTrailGeometry.setDrawRange(0,0);return}this.trailPositionsHigh=new Float32Array(e*this.maxTrailPoints*3),this.trailPositionsLow=new Float32Array(e*this.maxTrailPoints*3),this.trailColors=new Float32Array(e*this.maxTrailPoints*3),this.trailIndices=new Uint32Array(e*this.maxTrailPoints*2);for(let i=0;i<this.maxTrailPoints;i++){const n=i*e*2,r=(i+1)%this.maxTrailPoints;for(let a=0;a<e;a++)this.trailIndices[n+a*2+0]=i*e+a,this.trailIndices[n+a*2+1]=r*e+a}const t=new Map;for(const[i,n]of this.bodies)this.trailOffsets.has(i)&&t.set(this.trailOffsets.get(i),new Ae(n.baseColor??4491519));for(let i=0;i<this.maxTrailPoints;i++)for(let n=0;n<e;n++){const r=t.get(n)||new Ae(4491519),a=(i*e+n)*3;this.trailColors[a+0]=r.r,this.trailColors[a+1]=r.g,this.trailColors[a+2]=r.b}this.globalTrailHead=0,this.trailInitialized.clear(),this.fullBufferUpdateNeeded=!0,this.globalTrailGeometry.setAttribute("positionHigh",new lt(this.trailPositionsHigh,3)),this.globalTrailGeometry.setAttribute("positionLow",new lt(this.trailPositionsLow,3)),this.globalTrailGeometry.setAttribute("color",new lt(this.trailColors,3)),this.globalTrailGeometry.setIndex(new lt(this.trailIndices,1)),this.globalTrailGeometry.setDrawRange(0,e*this.maxTrailPoints*2)}setGridOptions(e,t,i,n,r){this.gridXYVisible=e,this.gridXZVisible=t,this.gridYZVisible=i,this.gridSpacing=Math.max(n,1),this.gridSize=Math.max(1,Math.round(r)),this.rebuildGrid(this.lastOrigin??{x:0,y:0,z:0})}pickBodyId(e){const t=[];for(const a of this.bodies.values())t.push(a.getPickMesh());if(t.length===0)return null;const i=e.intersectObjects(t,!1);if(i.length===0)return null;const r=i[0].object.userData.bodyId;return typeof r=="number"?r:null}updateBodies(e,t){for(const i of this.bodies.values())i.updateRotation(e,t)}setGhostPreview(e){const t=e.radius,i=e.color,n=e.type,r=t*this.renderScale;if(!this.ghostMesh){const o=new ti(1,32,16),l=new Tn({color:i,transparent:!0,opacity:.4,wireframe:n==="spacecraft"});this.ghostMesh=new at(o,l),this.ghostMesh.visible=!1,this.solarSystemRoot.add(this.ghostMesh)}const a=this.ghostMesh.material;if(a.color.setHex(i),a.wireframe=n==="spacecraft",this.ghostMesh.scale.setScalar(r),e.hasAtmosphere){if(!this.ghostAtmoMesh){const x=new ti(1,32,16),T=new dt({vertexShader:Sc,fragmentShader:Mc,uniforms:{u_rayleighColor:{value:new w},u_mieColor:{value:new w},u_intensity:{value:1},u_numLights:{value:0},u_lightPos:{value:[new w,new w,new w,new w]},u_lightColor:{value:[new w,new w,new w,new w]},u_lightIntensity:{value:[0,0,0,0]},u_planetCenter:{value:new w(0,0,0)},u_planetRadius:{value:1},u_atmoRadius:{value:1.05},u_isInside:{value:0},u_scaleHeight:{value:.085}},transparent:!0,depthWrite:!1,side:Ct,blending:vi});this.ghostAtmoMesh=new at(x,T),this.ghostAtmoMesh.visible=!1,this.solarSystemRoot.add(this.ghostAtmoMesh)}const o=this.ghostAtmoMesh.material,l=e.atmosphereHeight?e.atmosphereHeight*this.renderScale:r*.05,c=r+l;this.ghostAtmoMesh.scale.setScalar(c),o.uniforms.u_planetRadius.value=r,o.uniforms.u_atmoRadius.value=c;const h=l/r;o.uniforms.u_intensity.value=Math.min(1,.4+h*2);const d=(e.atmosphereHeight??6e4)*.085,p=d*3,g=e.atmosphereRayleighR??.005,y=e.atmosphereRayleighG??.012,m=e.atmosphereRayleighB??.03;o.uniforms.u_rayleighColor.value.set(g*p,y*p,m*p);const v=(e.atmosphereMieWeight??.001)*p,_=e.atmosphereMieColor??16777215;o.uniforms.u_mieColor.value.set((_>>16&255)/255*v,(_>>8&255)/255*v,(_&255)/255*v),o.uniforms.u_scaleHeight.value=d/Math.max(e.atmosphereHeight??6e4,1),this.ghostAtmoMesh.visible=this.ghostMesh.visible}else this.ghostAtmoMesh&&(this.ghostAtmoMesh.visible=!1)}updateGhostPosition(e,t,i,n){if(this.ghostMesh&&this.ghostMesh.position.set(e,t,i),this.ghostAtmoMesh){this.ghostAtmoMesh.position.set(e,t,i);const r=this.ghostAtmoMesh.material;let a=0;for(const h of this.bodies.values())if(h.type==="star"&&a<4){const d=h.group.position;r.uniforms.u_lightPos.value[a].set(d.x,d.z,-d.y),r.uniforms.u_lightColor.value[a].set(1,1,1),r.uniforms.u_lightIntensity.value[a]=1,a++}r.uniforms.u_numLights.value=a,r.uniforms.u_planetCenter.value.set(e,i,-t);const l=new w(n.x,-n.z,n.y).distanceTo(new w(e,t,i)),c=this.ghostAtmoMesh.scale.x;r.uniforms.u_isInside.value=l<c?1:0}}setGhostVisible(e){this.ghostVisible=e,this.ghostMesh&&(this.ghostMesh.visible=e),this.ghostAtmoMesh&&(e?this.ghostAtmoMesh.visible=this.showAtmospheres:this.ghostAtmoMesh.visible=!1)}isGhostVisible(){return this.ghostVisible}removeGhost(){this.ghostMesh&&(this.solarSystemRoot.remove(this.ghostMesh),this.ghostMesh.geometry.dispose(),this.ghostMesh.material.dispose(),this.ghostMesh=null),this.ghostAtmoMesh&&(this.solarSystemRoot.remove(this.ghostAtmoMesh),this.ghostAtmoMesh.geometry.dispose(),this.ghostAtmoMesh.material.dispose(),this.ghostAtmoMesh=null),this.ghostVisible=!1}getTrailStats(){const e=this.nextTrailOffset*this.maxTrailPoints;return{lineCount:this.nextTrailOffset,totalVertices:e}}dispose(){this.removeGhost(),this.solarSystemRoot&&this.scene.remove(this.solarSystemRoot);for(const e of this.bodies.values())e.dispose();this.bodies.clear(),this.globalTrailMesh&&(this.scene.remove(this.globalTrailMesh),this.globalTrailGeometry.dispose(),this.globalTrailMaterial.dispose()),this.trailOffsets.clear(),this.nextTrailOffset=0,this.currentNumTrails=0,this.trailInitialized.clear(),this.reallocateTrailBuffers();for(const e of this.bodyLabels.values())e.el.parentNode&&e.el.parentNode.removeChild(e.el);this.bodyLabels.clear(),this.labelContainer&&this.labelContainer.parentNode&&this.labelContainer.parentNode.removeChild(this.labelContainer),this.axisLines.clear(),this.refPlanes.clear(),this.refLines.clear(),this.refPoints.clear(),this.removeGhost(),this.gridGroup&&(this.scene.remove(this.gridGroup),this.disposeGrid(this.gridGroup),this.gridGroup=null)}rebuildGrid(e={x:0,y:0,z:0}){if(this.gridGroup&&(this.scene.remove(this.gridGroup),this.disposeGrid(this.gridGroup),this.gridGroup=null),!this.gridXYVisible&&!this.gridXZVisible&&!this.gridYZVisible)return;this.gridBuildOrigin={x:e.x,y:e.y,z:e.z},this.gridGroup=new gi,this.gridGroup.position.set(0,0,0);const t=new es({color:16777215,transparent:!0,opacity:.25}),i=Math.max(2,this.gridSize*2),n=i/2;this.gridXZVisible&&this.gridGroup.add(this.buildGridPlane(i,n,this.gridSpacing,"xz",t,this.gridBuildOrigin)),this.gridXYVisible&&this.gridGroup.add(this.buildGridPlane(i,n,this.gridSpacing,"xy",t,this.gridBuildOrigin)),this.gridYZVisible&&this.gridGroup.add(this.buildGridPlane(i,n,this.gridSpacing,"yz",t,this.gridBuildOrigin)),this.scene.add(this.gridGroup)}buildGridPlane(e,t,i,n,r,a){const o=(e+1)*2,l=new Float32Array(o*2*3);let c=0;const h=t*i;for(let f=0;f<=e;f++){const p=(f-t)*i;n==="xz"?(l[c++]=-h-a.x,l[c++]=0-a.y,l[c++]=p-a.z,l[c++]=h-a.x,l[c++]=0-a.y,l[c++]=p-a.z,l[c++]=p-a.x,l[c++]=0-a.y,l[c++]=-h-a.z,l[c++]=p-a.x,l[c++]=0-a.y,l[c++]=h-a.z):n==="xy"?(l[c++]=-h-a.x,l[c++]=p-a.y,l[c++]=0-a.z,l[c++]=h-a.x,l[c++]=p-a.y,l[c++]=0-a.z,l[c++]=p-a.x,l[c++]=-h-a.y,l[c++]=0-a.z,l[c++]=p-a.x,l[c++]=h-a.y,l[c++]=0-a.z):(l[c++]=0-a.x,l[c++]=-h-a.y,l[c++]=p-a.z,l[c++]=0-a.x,l[c++]=h-a.y,l[c++]=p-a.z,l[c++]=0-a.x,l[c++]=p-a.y,l[c++]=-h-a.z,l[c++]=0-a.x,l[c++]=p-a.y,l[c++]=h-a.z)}const d=new vt;return d.setAttribute("position",new lt(l,3)),new Lr(d,r)}disposeGrid(e){for(const t of e.children)(t instanceof Lr||t instanceof tr)&&(t.geometry.dispose(),Array.isArray(t.material)?t.material.forEach(i=>i.dispose()):t.material.dispose())}}class Rt{bodyData;group;mesh;geometry;material;atmosphereMesh=null;starMaterial=null;granulationTexture=null;flareSystem=null;ringMesh=null;cloudMesh=null;ringData=null;heroMesh=null;currentLodTier="base";isInstanced=!1;instanceId=-1;instancedMeshRef=null;static textureLoader=new yu;static textureCache=new Map;baseColor=null;realRadius;type;oblateness=0;rotationRate=0;starDrift=new Te;starSpotPhase=0;lastSimTime=0;currentSegments={width:0,height:0};_lightPosScratch=[new w,new w,new w,new w];_lightColorScratch=[new w,new w,new w,new w];_lightIntensityScratch=[0,0,0,0];_lightRadiusScratch=[0,0,0,0];_casterPosScratch=[new w,new w,new w,new w];_casterRadiusScratch=[0,0,0,0];createHeroMesh(){if(this.heroMesh||!this.baseColor)return;const e=new ti(1,vg,yg),t=new Kn({color:this.baseColor,roughness:.8,metalness:.1});this.setupShadowMaterial(t),this.heroMesh=new at(e,t),this.heroMesh.visible=!1,this.mesh.add(this.heroMesh)}constructor(e,t,i,n,r){if(this.bodyData=e,this.realRadius=e.radius,this.type=e.type,this.oblateness=e.oblateness??0,this.group=new gi,this.group.name=e.name,this.rotationRate=e.rotationRate??0,e.poleRa!==void 0&&e.poleDec!==void 0){const o=new w(Math.cos(e.poleDec)*Math.cos(e.poleRa),Math.cos(e.poleDec)*Math.sin(e.poleRa),Math.sin(e.poleDec));o.applyAxisAngle(new w(1,0,0),-23.4392811*Math.PI/180),this.group.quaternion.setFromUnitVectors(new w(0,1,0),o)}else{const o=e.axialTilt??0,l=new w(-Math.sin(o),0,Math.cos(o));this.group.quaternion.setFromUnitVectors(new w(0,1,0),l)}const a=1;if(this.geometry=new ti(a,t,i),e.type==="star"){const o=e.effectiveTemperature??5778,[l,c,h]=rs(o>0?o:5778),[d,f]=e.limbDarkeningCoeffs??[.6,0],p=(e.seed??e.id)|0;this.granulationTexture=Bg(p===0?1:p);const g=Math.max(0,Math.min(.3,e.spotFraction??0));this.material=new dt({vertexShader:Ag,fragmentShader:Pg,uniforms:{u_color:{value:new w(l,c,h)},u_limbA:{value:d},u_limbB:{value:f},u_granulationMap:{value:this.granulationTexture},u_granulationStrength:{value:n.granulationEnabled?1:0},u_drift:{value:new Te},u_spotPhase:{value:0},u_spotFraction:{value:g},u_spotEnabled:{value:n.starspotsEnabled?1:0},u_spotSeed:{value:p===0?1:p},u_emissiveStrength:{value:1.2}}}),this.starMaterial=this.material,this.flareSystem=new Ng(p,e.flareRate??0,o,n.flareQuality)}else if(r!==void 0){this.isInstanced=!0,this.instanceId=r;const o=e.color||Rt.deriveColorFromPhysics(e);this.baseColor=o,this.mesh=new gi,this.mesh.userData.bodyId=e.id}else{const o=e.color||Rt.deriveColorFromPhysics(e);this.baseColor=o;const l=new Kn({color:o,roughness:.8,metalness:.1});this.material=l,this.setupShadowMaterial(l)}if(!this.isInstanced&&this.material&&(this.mesh=new at(this.geometry,this.material),this.mesh.userData.bodyId=e.id),this.group.add(this.mesh),this.flareSystem&&this.mesh.add(this.flareSystem.group),e.type==="star"){const o=e.effectiveTemperature??5778,[l,c,h]=rs(o>0?o:5778),d=(Math.round(l*255)&255)<<16|(Math.round(c*255)&255)<<8|Math.round(h*255)&255,f=e.luminosity??1;this.addStarGlow(d,f)}if(e.atmosphere&&e.atmosphere.height>0&&this.addAtmosphereShell(e,t,i),e.rings){this.ringData={innerMult:e.rings.innerRadiusMult,outerMult:e.rings.outerRadiusMult};const o=new ar(a*e.rings.innerRadiusMult,a*e.rings.outerRadiusMult,128,1),l=o.attributes.position,c=o.attributes.uv;for(let g=0;g<l.count;g++){const u=(new w().fromBufferAttribute(l,g).length()-a*e.rings.innerRadiusMult)/(a*(e.rings.outerRadiusMult-e.rings.innerRadiusMult));c.setY(g,u)}const h=Lg(e.rings.texturePreset);h.baseOpacity=e.rings.baseOpacity;const d=Ll(h);this.material&&this.material.userData.ringMap&&(this.material.userData.ringMap.value=d);let f=h.scatteringG??(e.rings.texturePreset==="saturn"?.7:.3);const p=new dt({vertexShader:Ig,fragmentShader:Dg,uniforms:{u_ringMap:{value:d},u_numLights:{value:0},u_lightPos:{value:[new w,new w,new w,new w]},u_lightColor:{value:[new w,new w,new w,new w]},u_lightIntensity:{value:[0,0,0,0]},u_lightRadius:{value:[0,0,0,0]},u_numCasters:{value:0},u_casterPos:{value:[new w,new w,new w,new w]},u_casterRadius:{value:[0,0,0,0]},u_shadowQuality:{value:0},u_planetCenter:{value:new w},u_planetRadius:{value:1},u_g:{value:f},u_perfMode:{value:0},u_isHorizontal:{value:0},u_textureVScale:{value:1}},transparent:!0,side:Ct,depthWrite:!1,toneMapped:!0});p.userData.baseOpacity=h.baseOpacity,p.userData.proceduralMap=d,this.ringMesh=new at(o,p),this.ringMesh.renderOrder=2,this.ringMesh.userData.preset=e.rings.texturePreset,this.ringMesh.userData.profile=h,this.ringMesh.rotation.x=-Math.PI/2,this.group.add(this.ringMesh)}}addAtmosphereShell(e,t,i){const n=e.atmosphere,r=n.scaleHeight,a=75e3,o=n.rayleighCoefficients,l=new w(Math.min(o[0]*a,2.5),Math.min(o[1]*a,2.5),Math.min(o[2]*a,2.5)),c=n.mieColor??[1,1,1],h=Math.min(n.mieCoefficient*a,2),d=new w(c[0]*h,c[1]*h,c[2]*h),f=n.height/e.radius,p=Math.min(1,.4+f*2),g=r/Math.max(n.height,1),y=new ti(1,t,i),m=new dt({vertexShader:Sc,fragmentShader:Mc,uniforms:{u_rayleighColor:{value:l},u_mieColor:{value:d},u_intensity:{value:p},u_numLights:{value:0},u_lightPos:{value:[new w,new w,new w,new w]},u_lightColor:{value:[new w,new w,new w,new w]},u_lightIntensity:{value:[0,0,0,0]},u_planetCenter:{value:new w},u_planetRadius:{value:1},u_atmoRadius:{value:1.05},u_isInside:{value:0},u_scaleHeight:{value:g}},transparent:!0,side:Ct,depthWrite:!1,blending:vi,toneMapped:!0});this.atmosphereMesh=new at(y,m),this.atmosphereMesh.userData.atmosphereScale=1+f,this.atmosphereMesh.userData.isAtmosphere=!0,this.group.add(this.atmosphereMesh)}static deriveColorFromPhysics(e){const t=e.composition??"Rocky",i=e.albedo??.3,n=Math.max(.15,Math.min(.95,i));switch(t){case"GasGiant":{const r=Math.round(180*n+40),a=Math.round(140*n+30),o=Math.round(80*n+20);return r<<16|a<<8|o}case"IceGiant":{const r=Math.round(80*n+30),a=Math.round(160*n+40),o=Math.round(200*n+40);return r<<16|a<<8|o}case"Dwarf":{const r=Math.round(180*n+40);return r<<16|r<<8|r}default:{const r=Math.round(140*n+40),a=Math.round(120*n+35),o=Math.round(100*n+30);return r<<16|a<<8|o}}}updateRotation(e,t){let i=e-this.lastSimTime;if(Math.abs(i)>31536e5&&(i=0),this.lastSimTime=e,this.starMaterial?.uniforms.u_drift&&(this.starDrift.x=(this.starDrift.x+i*.0016)%1,this.starDrift.x<0&&(this.starDrift.x+=1),this.starDrift.y=(this.starDrift.y+i*.0011)%1,this.starDrift.y<0&&(this.starDrift.y+=1),this.starSpotPhase=(this.starSpotPhase+i*1e-5)%(Math.PI*2),this.starSpotPhase<0&&(this.starSpotPhase+=Math.PI*2),this.starMaterial.uniforms.u_drift.value.copy(this.starDrift),this.starMaterial.uniforms.u_spotPhase.value=this.starSpotPhase),this.flareSystem?.update(e,t),this.rotationRate===0)return;const n=this.rotationRate*e;this.mesh.rotation.y=n,this.atmosphereMesh&&(this.atmosphereMesh.rotation.y=n),this.cloudMesh&&(this.cloudMesh.rotation.y=e*(this.cloudMesh.userData.rotationSpeed??0))}setGranulationEnabled(e){this.starMaterial?.uniforms.u_granulationStrength&&(this.starMaterial.uniforms.u_granulationStrength.value=e?1:0)}setStarspotsEnabled(e){this.starMaterial?.uniforms.u_spotEnabled&&(this.starMaterial.uniforms.u_spotEnabled.value=e?1:0)}setFlareQuality(e){this.flareSystem?.setQuality(e)}setFlareFrequencyMode(e){this.flareSystem?.setFrequencyMode(e)}setFixedFlareRate(e){this.flareSystem?.setFixedFlareRate(e)}setFlareBrightness(e){this.flareSystem?.setBrightness(e)}setScale(e){if(this.oblateness>.001?this.mesh.scale.set(e,e*(1-this.oblateness),e):this.mesh.scale.setScalar(e),this.atmosphereMesh){const t=this.atmosphereMesh.userData.atmosphereScale,i=e*t;this.oblateness>.001?this.atmosphereMesh.scale.set(i,i*(1-this.oblateness),i):this.atmosphereMesh.scale.setScalar(i)}this.ringMesh&&this.ringMesh.scale.setScalar(e);for(const t of this.group.children)t instanceof Uo&&t.scale.set(e*8,e*8,1)}setSegments(e,t){this.isInstanced||this.currentSegments.width===e&&this.currentSegments.height===t||(this.currentSegments={width:e,height:t},this.geometry&&this.geometry.dispose(),this.geometry=new ti(1,e,t),this.mesh&&this.mesh instanceof at&&(this.mesh.geometry=this.geometry),this.atmosphereMesh&&(this.atmosphereMesh.geometry.dispose(),this.atmosphereMesh.geometry=new ti(1,e,t)))}addStarGlow(e,t){const i=Math.min(1,.3+.15*Math.log10(Math.max(t,.01))),n=new hc({map:this.createGlowTexture(),color:e,transparent:!0,opacity:i,blending:$i,depthWrite:!1}),r=new Uo(n);r.scale.set(1,1,1),this.group.add(r)}createGlowTexture(){const t=document.createElement("canvas");t.width=256,t.height=256;const i=t.getContext("2d"),n=i.createRadialGradient(256/2,256/2,0,256/2,256/2,256/2);return n.addColorStop(0,"rgba(255, 255, 255, 1)"),n.addColorStop(.15,"rgba(255, 255, 255, 0.85)"),n.addColorStop(.4,"rgba(255, 255, 255, 0.3)"),n.addColorStop(1,"rgba(255, 255, 255, 0)"),i.fillStyle=n,i.fillRect(0,0,256,256),new Za(t)}updateRingQuality(e,t,i){if(!this.ringMesh||!(this.ringMesh.material instanceof dt))return;let n=!1;if(e==="HighQualityAlways")n=!0;else if(e==="HighQualityClose"){const o=this.realRadius*i*100;n=t<o}const r=this.ringMesh.material;r.uniforms.u_perfMode.value=n?0:1}setAtmosphereVisibility(e){this.atmosphereMesh&&(this.atmosphereMesh.visible=e)}updateLighting(e,t,i,n,r,a,o,l){const c=this.realRadius*l,h=this._lightPosScratch,d=this._lightColorScratch,f=this._lightIntensityScratch,p=this._lightRadiusScratch;for(let u=0;u<t;u++){h[u].set(e[u].position.x,e[u].position.z,-e[u].position.y),d[u].set(e[u].color.r,e[u].color.g,e[u].color.b),p[u]=e[u].radius*l;const v=e[u].luminosity,_=Math.min(10,Math.max(.5,1.5+Math.log10(Math.max(v,.001))));f[u]=_*Ze*Ze}const g=this._casterPosScratch,y=this._casterRadiusScratch;for(let u=0;u<n;u++)g[u].set(i[u].position.x,i[u].position.z,-i[u].position.y),y[u]=i[u].radius*l;const m=u=>{if((u instanceof Kn||u instanceof Xo)&&u.userData.numLights){u.userData.numLights.value=t;for(let v=0;v<t;v++)u.userData.lightPos.value[v].copy(h[v]),u.userData.lightColor.value[v].copy(d[v]),u.userData.lightIntensity.value[v]=f[v],u.userData.lightRadius.value[v]=p[v];u.userData.numCasters.value=n;for(let v=0;v<n;v++)u.userData.casterPos.value[v].copy(g[v]),u.userData.casterRadius.value[v]=y[v];u.userData.shadowQuality.value=r==="Off"?0:r==="Binary"?1:2,u.userData.planetCenter.set(a.x,a.z,-a.y),u.userData.planetRadius.value=c}};if(this.material&&m(this.material),this.heroMesh&&this.heroMesh.material&&(Array.isArray(this.heroMesh.material)?this.heroMesh.material:[this.heroMesh.material]).forEach(m),this.cloudMesh&&this.cloudMesh.material&&(Array.isArray(this.cloudMesh.material)?this.cloudMesh.material:[this.cloudMesh.material]).forEach(m),this.ringMesh&&this.ringMesh.material instanceof dt){const u=this.ringMesh.material;u.uniforms.u_numLights.value=t;for(let v=0;v<t;v++)u.uniforms.u_lightPos.value[v].copy(h[v]),u.uniforms.u_lightColor.value[v].copy(d[v]),u.uniforms.u_lightIntensity.value[v]=f[v],u.uniforms.u_lightRadius.value[v]=p[v];u.uniforms.u_numCasters.value=n;for(let v=0;v<n;v++)u.uniforms.u_casterPos.value[v].copy(g[v]),u.uniforms.u_casterRadius.value[v]=y[v];u.uniforms.u_shadowQuality.value=r==="Off"?0:r==="Binary"?1:2,u.uniforms.u_planetCenter.value.set(a.x,a.z,-a.y),u.uniforms.u_planetRadius.value=c}if(this.atmosphereMesh&&this.atmosphereMesh.material instanceof dt){const u=this.atmosphereMesh.material;u.uniforms.u_numLights.value=t;for(let T=0;T<t;T++)u.uniforms.u_lightPos.value[T].copy(h[T]),u.uniforms.u_lightColor.value[T].copy(d[T]),u.uniforms.u_lightIntensity.value[T]=f[T];u.uniforms.u_planetCenter&&u.uniforms.u_planetCenter.value.set(a.x,a.z,-a.y);const v=a.length(),_=this.atmosphereMesh.userData.atmosphereScale||1,x=c*_;u.uniforms.u_planetRadius&&(u.uniforms.u_planetRadius.value=c),u.uniforms.u_atmoRadius&&(u.uniforms.u_atmoRadius.value=x),u.uniforms.u_isInside&&(u.uniforms.u_isInside.value=v<x?1:0)}}updateRingProfile(e){if(!this.ringMesh)return;const t=Ll(e);this.ringMesh.userData.profile=e,this.material&&this.material.userData.ringMap&&(this.material.userData.ringMap.value&&this.material.userData.ringMap.value.dispose(),this.material.userData.ringMap.value=t);const i=this.ringMesh.material;if(i instanceof dt){const n=i.uniforms.u_ringMap.value;n&&n.dispose(),i.uniforms.u_ringMap.value=t,i.uniforms.u_g.value=e.scatteringG??.3,i.userData.baseOpacity=e.baseOpacity}}applyRealisticTextures(e){if(this.type==="star"||!(this.material instanceof Kn))return;const t=this.material,i=this.group.name.toLowerCase();if(!e){if(t.map=null,t.color.set(this.baseColor??16777215),t.needsUpdate=!0,this.cloudMesh&&(this.cloudMesh.visible=!1),this.ringMesh&&this.ringMesh.material instanceof dt){const r=this.ringMesh.material;r.userData.proceduralMap&&(r.uniforms.u_ringMap.value=r.userData.proceduralMap,r.uniforms.u_isHorizontal.value=0,r.uniforms.u_textureVScale.value=1)}return}let n="";if(i==="mercury"?n="2k_mercury.jpg":i==="venus"?n="2k_venus_surface.jpg":i==="earth"?n="2k_earth_daymap.jpg":i==="moon"?n="2k_moon.jpg":i==="mars"?n="2k_mars.jpg":i==="jupiter"?n="2k_jupiter.jpg":i==="saturn"?n="2k_saturn.jpg":i==="uranus"?n="2k_uranus.jpg":i==="neptune"&&(n="2k_neptune.jpg"),n){const r=`/Symplectica/textures/planets/${n}`;Rt.textureCache.has(r)?(t.map=Rt.textureCache.get(r),t.color.set(16777215),t.needsUpdate=!0):Rt.textureLoader.load(r,a=>{a.colorSpace=Dt,Rt.textureCache.set(r,a),t===this.material&&(t.map=a,t.color.set(16777215),t.needsUpdate=!0)})}if(i==="earth"){if(!this.cloudMesh){const a=new ti(this.geometry.parameters.radius*1.005,64,64),o=new Xo({color:16777215,transparent:!0,opacity:.9,blending:vi,depthWrite:!1});this.cloudMesh=new at(a,o),this.setupShadowMaterial(o),this.cloudMesh.userData.rotationSpeed=15e-7,this.mesh.add(this.cloudMesh)}this.cloudMesh.visible=!0;const r="/Symplectica/textures/planets/2k_earth_clouds.jpg";Rt.textureCache.has(r)?(this.cloudMesh.material.alphaMap=Rt.textureCache.get(r),this.cloudMesh.material.needsUpdate=!0):Rt.textureLoader.load(r,a=>{Rt.textureCache.set(r,a),this.cloudMesh&&(this.cloudMesh.material.alphaMap=a,this.cloudMesh.material.needsUpdate=!0)})}if(i==="saturn"&&this.ringMesh&&this.ringMesh.material instanceof dt){const r=this.ringMesh.material,a="/Symplectica/textures/planets/2k_saturn_ring_alpha.png",o=this.ringData?.innerMult||1.11,h=((this.ringData?.outerMult||7.96)-o)/(2.35-o);Rt.textureCache.has(a)?(r.uniforms.u_ringMap.value=Rt.textureCache.get(a),r.uniforms.u_isHorizontal.value=1,r.uniforms.u_textureVScale.value=h):Rt.textureLoader.load(a,d=>{d.colorSpace=Dt,Rt.textureCache.set(a,d),this.ringMesh&&this.ringMesh.material===r&&(r.uniforms.u_ringMap.value=d,r.uniforms.u_isHorizontal.value=1,r.uniforms.u_textureVScale.value=h)})}}dispose(){this.isInstanced||(this.geometry&&this.geometry.dispose(),this.material&&this.material.dispose()),this.granulationTexture?.dispose(),this.flareSystem?.dispose(),this.atmosphereMesh&&(this.atmosphereMesh.geometry.dispose(),this.atmosphereMesh.material.dispose())}setupShadowMaterial(e){const t=this.bodyData;let i=new w(0,1,0);if(t.rings)if(t.poleRa!==void 0&&t.poleDec!==void 0){const n=new w(Math.cos(t.poleDec)*Math.cos(t.poleRa),Math.cos(t.poleDec)*Math.sin(t.poleRa),Math.sin(t.poleDec));n.applyAxisAngle(new w(1,0,0),-23.4392811*Math.PI/180),i=new w(n.x,n.z,-n.y).normalize()}else{const n=t.axialTilt??0;i=new w(0,Math.cos(n),Math.sin(n)).normalize()}e.userData.numLights={value:0},e.userData.lightPos={value:[new w,new w,new w,new w]},e.userData.lightColor={value:[new w,new w,new w,new w]},e.userData.lightIntensity={value:[0,0,0,0]},e.userData.lightRadius={value:[0,0,0,0]},e.userData.planetCenter=new w,e.userData.planetRadius={value:1},e.userData.innerRadius={value:t.rings?t.rings.innerRadiusMult:0},e.userData.outerRadius={value:t.rings?t.rings.outerRadiusMult:0},e.userData.ringMap={value:null},e.userData.ringNormal={value:i},e.userData.numCasters={value:0},e.userData.casterPos={value:[new w,new w,new w,new w]},e.userData.casterRadius={value:[0,0,0,0]},e.userData.shadowQuality={value:0},e.onBeforeCompile=n=>{e.customProgramCacheKey=()=>"planet_ring_shadow_multi",n.uniforms.u_numLightsPlanet=e.userData.numLights,n.uniforms.u_lightPosPlanet=e.userData.lightPos,n.uniforms.u_lightColorPlanet=e.userData.lightColor,n.uniforms.u_lightIntensityPlanet=e.userData.lightIntensity,n.uniforms.u_lightRadiusPlanet=e.userData.lightRadius,n.uniforms.u_planetCenter={value:e.userData.planetCenter},n.uniforms.u_planetRadius=e.userData.planetRadius,n.uniforms.u_innerRadius=e.userData.innerRadius,n.uniforms.u_outerRadius=e.userData.outerRadius,n.uniforms.u_ringMapPlanet=e.userData.ringMap,n.uniforms.u_ringNormal=e.userData.ringNormal,n.uniforms.u_numCasters=e.userData.numCasters,n.uniforms.u_casterPos=e.userData.casterPos,n.uniforms.u_casterRadius=e.userData.casterRadius,n.uniforms.u_shadowQuality=e.userData.shadowQuality,n.vertexShader=n.vertexShader.replace("#include <common>",`#include <common>
                varying vec3 vWorldPositionPlanet;`),n.vertexShader=n.vertexShader.replace("#include <worldpos_vertex>",`#include <worldpos_vertex>
                vWorldPositionPlanet = (modelMatrix * vec4(transformed, 1.0)).xyz;`),n.fragmentShader=n.fragmentShader.replace("#include <common>",`#include <common>
                varying vec3 vWorldPositionPlanet;
                #define MAX_LIGHTS 4
                #define MAX_CASTERS 4
                uniform int u_numLightsPlanet;
                uniform vec3 u_lightPosPlanet[MAX_LIGHTS];
                uniform vec3 u_lightColorPlanet[MAX_LIGHTS];
                uniform float u_lightIntensityPlanet[MAX_LIGHTS];
                uniform float u_lightRadiusPlanet[MAX_LIGHTS];
                uniform vec3 u_planetCenter;
                uniform float u_planetRadius;
                uniform float u_innerRadius;
                uniform float u_outerRadius;
                uniform sampler2D u_ringMapPlanet;
                uniform vec3 u_ringNormal;
                uniform int u_numCasters;
                uniform vec3 u_casterPos[MAX_CASTERS];
                uniform float u_casterRadius[MAX_CASTERS];
                uniform int u_shadowQuality;

                float diskOverlapArea(float d, float r1, float r2) {
                    if (d >= r1 + r2) return 0.0;
                    if (d <= abs(r1 - r2)) {
                        float r = min(r1, r2);
                        return 3.14159265359 * r * r;
                    }
                    float r1sq = r1 * r1;
                    float r2sq = r2 * r2;
                    float dsq = d * d;
                    float a1 = acos(clamp((dsq + r1sq - r2sq) / (2.0 * d * r1), -1.0, 1.0));
                    float a2 = acos(clamp((dsq + r2sq - r1sq) / (2.0 * d * r2), -1.0, 1.0));
                    float area = r1sq * a1 + r2sq * a2 - 0.5 * sqrt(max(0.0, 4.0 * dsq * r1sq - pow(dsq + r1sq - r2sq, 2.0)));
                    return area;
                }`),n.fragmentShader=n.fragmentShader.replace("#include <dithering_fragment>",`#include <dithering_fragment>
                float totalIrradiance = 0.0;
                float shadowFactor = 0.0;
                
                for (int i = 0; i < MAX_LIGHTS; i++) {
                    if (i >= u_numLightsPlanet) break;
                    
                    vec3 toLight = u_lightPosPlanet[i] - vWorldPositionPlanet;
                    float distLight = length(toLight);
                    vec3 lightDirR = toLight / distLight;
                    
                    float lightVisAmt = 1.0;

                    // 1. Eclipse Shadows (Casters)
                    if (u_shadowQuality > 0) {
                        float lightAngularRadius = u_lightRadiusPlanet[i] / distLight;
                        float lightArea = 3.14159265359 * lightAngularRadius * lightAngularRadius;

                        for (int j = 0; j < MAX_CASTERS; j++) {
                            if (j >= u_numCasters) break;
                            
                            vec3 toCaster = u_casterPos[j] - vWorldPositionPlanet;
                            float distCaster = length(toCaster);
                            
                            // Ignore casters behind the light
                            if (distCaster >= distLight) continue;
                            
                            vec3 casterDir = toCaster / distCaster;
                            float angularDist = length(lightDirR - casterDir);
                            float casterAngularRadius = u_casterRadius[j] / distCaster;
                            
                            if (u_shadowQuality == 1) { // Binary
                                if (angularDist < casterAngularRadius) {
                                    lightVisAmt = 0.0;
                                }
                            } else { // Penumbra
                                if (angularDist >= lightAngularRadius + casterAngularRadius) {
                                    continue; // Fast early-out
                                }
                                float overlap = diskOverlapArea(angularDist, lightAngularRadius, casterAngularRadius);
                                float occludedFrac = clamp(overlap / lightArea, 0.0, 1.0);
                                lightVisAmt *= (1.0 - occludedFrac);
                            }
                        }
                    }
                    
                    // 2. Ring Shadows
                    float denom = dot(lightDirR, u_ringNormal);
                    if (abs(denom) > 0.0001) {
                        float tR = -dot(vWorldPositionPlanet - u_planetCenter, u_ringNormal) / denom;
                        if (tR > 0.0 && tR < distLight) {
                            vec3 P = vWorldPositionPlanet + tR * lightDirR;
                            float r = length(P - u_planetCenter);
                            float rNorm = r / u_planetRadius;
                            if (rNorm >= u_innerRadius && rNorm <= u_outerRadius) {
                                float vTex = (rNorm - u_innerRadius) / (u_outerRadius - u_innerRadius);
                                vec4 rTex = texture2D(u_ringMapPlanet, vec2(0.5, vTex));
                                lightVisAmt *= (1.0 - rTex.a);
                            }
                        }
                    }
                    
                    float irradiance = u_lightIntensityPlanet[i] / (distLight * distLight);
                    totalIrradiance += irradiance;
                    shadowFactor += lightVisAmt * irradiance;
                }
                
                gl_FragColor.rgb *= max(0.05, shadowFactor / max(totalIrradiance, 1e-8));
                `)}}getPickMesh(){return this.mesh}}const Nl={debug:0,info:1,warn:2,error:3,none:4};let Ec="info";function Hs(s){return Nl[s]>=Nl[Ec]}const Le={setLevel(s){Ec=s},debug(...s){Hs("debug")&&console.log("[DEBUG]",...s)},info(...s){Hs("info")&&console.log("[INFO]",...s)},warn(...s){Hs("warn")&&console.warn("[WARN]",...s)},error(...s){Hs("error")&&console.error("[ERROR]",...s)}},zg=24;function kg(s){const e=new DataView(s),t=e.getUint32(0,!0),i=e.getUint32(4,!0),n=e.getFloat64(8,!0),r=e.getFloat64(16,!0),a=zg,o=Array.from(new Float64Array(s,a,i*3)),l=a+i*3*8,c=Array.from(new Float64Array(s,l,i*3));return{tick:t,time:n,positions:o,velocities:c,energy:r}}class Hg{ws=null;url;clientId=null;handlers=new Map;pingStart=0;latency=0;latencyHistory=[];pingIntervalId=null;serverTick=0;lastServerTime=0;reconnecting=!1;reconnectAttempts=0;maxReconnectAttempts=5;constructor(e="ws://localhost:8080"){this.url=e}async connect(e=5e3){return new Promise((t,i)=>{Le.info(`Connecting to ${this.url}...`),this.ws=new WebSocket(this.url);const n=setTimeout(()=>{this.ws?.readyState!==WebSocket.OPEN&&(this.ws?.close(),i(new Error(`Connection timed out after ${e}ms`)))},e);this.ws.onopen=()=>{clearTimeout(n),Le.info("Connected to server"),this.reconnecting=!1,this.reconnectAttempts=0,this.pingIntervalId!==null&&clearInterval(this.pingIntervalId),this.pingIntervalId=setInterval(()=>this.ping(),2e3),t()},this.ws.onclose=()=>{Le.info("Disconnected from server"),this.pingIntervalId!==null&&(clearInterval(this.pingIntervalId),this.pingIntervalId=null),this.latency=0,this.handleDisconnect()},this.ws.onerror=r=>{Le.error("WebSocket error:",r),this.reconnecting||(clearTimeout(n),i(new Error("WebSocket connection failed")))},this.ws.binaryType="arraybuffer",this.ws.onmessage=r=>{try{if(r.data instanceof ArrayBuffer){const o=kg(r.data),l={type:"state",payload:o,serverTick:o.tick};this.handleMessage(l);return}const a=JSON.parse(r.data);this.handleMessage(a)}catch(a){Le.error("Failed to parse message:",a)}}})}handleMessage(e){switch(e.serverTick!==void 0&&(this.serverTick=e.serverTick),e.timestamp!==void 0&&(this.lastServerTime=e.timestamp),e.type){case"welcome":this.handleWelcome(e.payload);break;case"pong":this.handlePong();break;case"state":case"snapshot":case"chat":case"admin_state":case"error":const t=this.handlers.get(e.type)||[];for(const i of t)i(e);break}}handleWelcome(e){this.clientId=e.clientId,this.serverTick=e.config.serverTick,Le.info(`Welcome! Client ID: ${this.clientId}`),Le.info(`Server tick: ${this.serverTick}`),Le.info(`Tick rate: ${e.config.tickRate} Hz`);const t=this.handlers.get("welcome")||[];for(const i of t)i({type:"welcome",payload:e})}handlePong(){const e=performance.now()-this.pingStart;this.latency=e/2,this.latencyHistory.push(this.latency),this.latencyHistory.length>30&&this.latencyHistory.shift()}handleDisconnect(){if(this.reconnecting||this.reconnectAttempts>=this.maxReconnectAttempts)return;this.reconnecting=!0,this.reconnectAttempts++;const e=Math.min(1e3*Math.pow(2,this.reconnectAttempts-1),1e4);Le.info(`Reconnecting in ${e}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`),setTimeout(()=>{this.connect().catch(()=>{this.reconnecting=!1})},e)}on(e,t){this.handlers.has(e)||this.handlers.set(e,[]),this.handlers.get(e).push(t)}off(e,t){const i=this.handlers.get(e);if(i){const n=i.indexOf(t);n!==-1&&i.splice(n,1)}}send(e,t){this.ws?.readyState===WebSocket.OPEN&&this.ws.send(JSON.stringify({type:e,payload:t}))}sendChat(e,t){this.send("chat",{sender:e,text:t})}sendAdminSettings(e){this.send("admin_settings",e)}sendTimeScale(e){this.send("set_time_scale",{simSecondsPerRealSecond:e})}sendSnapshot(e,t){this.send("apply_snapshot",{snapshot:e,presetName:t})}resetSimulation(){this.send("reset_simulation")}sendPause(e){this.send("set_pause",{paused:e})}ping(){this.pingStart=performance.now(),this.send("ping",{clientTick:this.serverTick})}requestSnapshot(){this.send("request_snapshot")}getLatency(){return this.latency}getAverageLatency(){return this.latencyHistory.length===0?0:this.latencyHistory.reduce((e,t)=>e+t,0)/this.latencyHistory.length}getServerTick(){return this.serverTick}isConnected(){return this.ws?.readyState===WebSocket.OPEN}disconnect(){this.reconnecting=!1,this.reconnectAttempts=this.maxReconnectAttempts,this.ws&&(this.ws.close(),this.ws=null)}}const Vg="modulepreload",Gg=function(s){return"/Symplectica/"+s},Ol={},Wg=function(e,t,i){let n=Promise.resolve();if(t&&t.length>0){let a=function(c){return Promise.all(c.map(h=>Promise.resolve(h).then(d=>({status:"fulfilled",value:d}),d=>({status:"rejected",reason:d}))))};document.getElementsByTagName("link");const o=document.querySelector("meta[property=csp-nonce]"),l=o?.nonce||o?.getAttribute("nonce");n=a(t.map(c=>{if(c=Gg(c),c in Ol)return;Ol[c]=!0;const h=c.endsWith(".css"),d=h?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${c}"]${d}`))return;const f=document.createElement("link");if(f.rel=h?"stylesheet":Vg,h||(f.as="script"),f.crossOrigin="",f.href=c,l&&f.setAttribute("nonce",l),document.head.appendChild(f),h)return new Promise((p,g)=>{f.addEventListener("load",p),f.addEventListener("error",()=>g(new Error(`Unable to preload CSS for ${c}`)))})}))}function r(a){const o=new Event("vite:preloadError",{cancelable:!0});if(o.payload=a,window.dispatchEvent(o),!o.defaultPrevented)throw a}return n.then(a=>{for(const o of a||[])o.status==="rejected"&&r(o.reason);return e().catch(r)})},Xg={id:"fullSolarSystemIV",barycentric:!0},qg={baseEpoch:"2026-01-01T00:00:00Z",tickRate:60,dt:.016666666666666666,substeps:4,forceMethod:"direct",theta:.5,timeScale:1,paused:!1,simMode:"hybrid",hybridMaxSteps:50,hybridBudgeted:!1,closeEncounterIntegrator:"none",closeEncounterHillFactor:3,closeEncounterTidalRatio:.001,closeEncounterJerkNorm:.01,closeEncounterMaxSubsetSize:8,closeEncounterMaxTrialSubsteps:128,closeEncounterRk45AbsTol:1e-7,closeEncounterRk45RelTol:1e-6,closeEncounterGaussRadauMaxIters:8,closeEncounterGaussRadauTol:1e-9},$g={showAtmospheres:!1,showOrbitTrails:!1,showStarLabels:!1,showPlanetLabels:!1,showMoonLabels:!1,showAxisLines:!1,showRefPlane:!1,showRefLine:!1,showRefPoint:!1,showGridXY:!1,showGridXZ:!1,showGridYZ:!1,gridSpacing:14959787070,gridSize:1e3,orbitTrailLength:800},Yg="Ultra",Zg={cameraFov:53,freeCamSpeedAuPerSec:.01,freeCamSensitivity:.2,freeCamRotationDamping:.55,surfaceSpeedMps:5,surfaceSensitivity:.3,surfaceRotationDamping:0,surfaceEyeHeightM:1.7,orbitalRotationDamping:.92,orbitalZoomDamping:.9},Kg={defaultPreset:Xg,adminDefaults:qg,optionsDefaults:$g,visualPresetDefault:Yg,cameraDefaults:Zg},ee=Kg,jg={scale:"solar",skyRadius:nr.solar.far},Qg={starCluster:{scale:"galactic",skyRadius:nr.galactic.far},solarCentauriI:{scale:"interstellar",skyRadius:nr.interstellar.far}};function Jg(s){const e=Math.round(Math.max(0,Math.min(1,s[0]))*255),t=Math.round(Math.max(0,Math.min(1,s[1]))*255),i=Math.round(Math.max(0,Math.min(1,s[2]))*255);return e<<16|t<<8|i}const e0={Sun:16768324,Mercury:9205843,Venus:15122985,Earth:4491519,Moon:8947848,Mars:12665870,Jupiter:13935988,Saturn:15390375,Uranus:7517380,Neptune:4022005,Pluto:14406601};class t0{module;simulation;initialized=!1;_cachedBodies=null;_cachedBodyCount=-1;G=0;AU=0;M_SUN=0;M_EARTH=0;async init(){Le.info("Loading WASM physics...");try{const e=await Wg(()=>import("./physics_core-COeu8V14.js"),[]);await e.default(),e.init(),this.module=e,this.G=this.module.getG(),this.AU=this.module.getAU(),this.M_SUN=this.module.getSolarMass(),this.M_EARTH=this.module.getEarthMass(),this.initialized=!0,Le.info("WASM physics loaded"),Le.info(`G = ${this.G} m³/(kg·s²)`),Le.info(`AU = ${this.AU} m`)}catch(e){throw Le.error("Failed to load WASM:",e),e}}createSunEarthMoon(){if(!this.initialized)throw new Error("Physics not initialized");this.simulation=this.module.createSunEarthMoon(BigInt(Date.now())),this.simulation.setDt(3600),this.simulation.setSubsteps(4),Le.info(`Created Sun-Earth-Moon system (${this.simulation.bodyCount()} bodies)`)}createNew(e){if(!this.initialized)throw new Error("Physics not initialized");this.simulation=new this.module.WasmSimulation(e??BigInt(Date.now())),this.simulation.setDt(3600),this.simulation.setSubsteps(4)}step(){this.simulation&&this.simulation.step()}stepN(e){this.simulation&&this.simulation.stepN(BigInt(e))}setTimeStep(e){this.simulation&&this.simulation.setDt(e)}setSubsteps(e){this.simulation&&e>0&&this.simulation.setSubsteps(e)}setTheta(e){this.simulation&&e>0&&this.simulation.setTheta(e)}useDirectForce(){this.simulation&&this.simulation.useDirectForce()}useBarnesHut(){this.simulation&&this.simulation.useBarnesHut()}setCloseEncounterIntegrator(e){this.simulation&&this.simulation.setCloseEncounterIntegrator(e)}setCloseEncounterThresholds(e,t,i){this.simulation&&this.simulation.setCloseEncounterThresholds(e,t,i)}setCloseEncounterLimits(e,t){this.simulation&&this.simulation.setCloseEncounterLimits(e,t)}setCloseEncounterRk45Tolerances(e,t){this.simulation&&this.simulation.setCloseEncounterRk45Tolerances(e,t)}setCloseEncounterGaussRadau(e,t){this.simulation&&this.simulation.setCloseEncounterGaussRadau(e,t)}takeCloseEncounterEvents(){if(!this.simulation)return[];try{const e=this.simulation.takeCloseEncounterEvents();return JSON.parse(e)}catch{return[]}}time(){return this.simulation?.time()??0}tick(){return Number(this.simulation?.tick()??0n)}bodyCount(){return this.simulation?.bodyCount()??0}getPositions(){return this.simulation?.getPositions()??new Float64Array(0)}getVelocities(){return this.simulation?.getVelocities()??new Float64Array(0)}totalEnergy(){return this.simulation?.totalEnergy()??0}kineticEnergy(){return this.simulation?.kineticEnergy()??0}potentialEnergy(){return this.simulation?.potentialEnergy()??0}totalMomentum(){return this.simulation?.totalMomentum()??new Float64Array(3)}centerOfMass(){return this.simulation?.centerOfMass()??new Float64Array(3)}angularMomentum(){return this.simulation?.angularMomentum()??new Float64Array(3)}getBodies(){if(!this.simulation)return[];const e=this.simulation.bodyCount();if(this._cachedBodies&&e===this._cachedBodyCount)return this._cachedBodies;try{const t=this.simulation.getBodiesJson(),n=JSON.parse(t).map(r=>({id:r.id,name:r.name,type:this.parseBodyType(r.body_type),mass:r.mass,radius:r.radius,color:e0[r.name]??Jg(r.color),axialTilt:r.axial_tilt??0,poleRa:r.pole_ra,poleDec:r.pole_dec,luminosity:r.luminosity??0,effectiveTemperature:r.effective_temperature??0,rotationRate:r.rotation_rate??0,seed:r.seed??0,oblateness:r.oblateness??0,scaleHeight:r.scale_height??0,equilibriumTemperature:r.equilibrium_temperature??0,metallicity:r.metallicity??0,age:r.age??0,spectralType:r.spectral_type??"",limbDarkeningCoeffs:r.limb_darkening_coeffs??[0,0],flareRate:r.flare_rate??0,spotFraction:r.spot_fraction??0,composition:r.composition??"Rocky",albedo:r.albedo??0,atmosphere:r.atmosphere?{scaleHeight:r.atmosphere.scale_height,rayleighCoefficients:r.atmosphere.rayleigh_coefficients,mieCoefficient:r.atmosphere.mie_coefficient,mieDirection:r.atmosphere.mie_direction,height:r.atmosphere.height,mieColor:r.atmosphere.mie_color??[1,1,1]}:void 0,rings:r.rings?{innerRadiusMult:r.rings.inner_radius_mult,outerRadiusMult:r.rings.outer_radius_mult,texturePreset:r.rings.texture_preset,baseOpacity:r.rings.base_opacity}:void 0,semiMajorAxis:r.semi_major_axis??0,eccentricity:r.eccentricity??0,meanSurfaceTemperature:r.mean_surface_temperature??0}));return this._cachedBodies=n,this._cachedBodyCount=e,n}catch(t){return Le.error("Failed to parse bodies:",t),[]}}parseBodyType(e){const t=e.toLowerCase();return t.includes("star")?"star":t.includes("moon")?"moon":t.includes("asteroid")?"asteroid":t.includes("comet")?"comet":t.includes("spacecraft")?"spacecraft":t.includes("testparticle")||t.includes("test_particle")?"test_particle":t.includes("player")?"player":"planet"}restoreSnapshot(e){return this.simulation?.fromJson(e)??!1}getSnapshot(){return this.simulation?.toJson()??"{}"}createPreset(e,t,i=!1,n,r){if(!this.initialized||!this.module)throw new Error("Physics not initialized");let a=e;switch(e){case"integratorTest1":this.simulation=this.module.createIntegratorTest1(t);break;case"integratorTest2":this.simulation=this.module.createIntegratorTest2(t);break;case"integratorTest3":this.simulation=this.module.createIntegratorTest3(t);break;case"innerSolarSystem":this.simulation=this.module.createInnerSolarSystem(t);break;case"fullSolarSystemII":i&&typeof this.module.createFullSolarSystemIIBarycentric=="function"?this.simulation=this.module.createFullSolarSystemIIBarycentric(t):typeof this.module.createFullSolarSystemII=="function"?this.simulation=this.module.createFullSolarSystemII(t):(Le.warn("Full Solar System II preset unavailable. Falling back to Sun-Earth-Moon."),this.simulation=this.module.createSunEarthMoon(t),a="sunEarthMoon");break;case"fullSolarSystemIII":i&&typeof this.module.createFullSolarSystemIIIBarycentric=="function"?this.simulation=this.module.createFullSolarSystemIIIBarycentric(t):typeof this.module.createFullSolarSystemIII=="function"?this.simulation=this.module.createFullSolarSystemIII(t):(Le.warn("Full Solar System III preset unavailable. Falling back to Sun-Earth-Moon."),this.simulation=this.module.createSunEarthMoon(t),a="sunEarthMoon");break;case"fullSolarSystemIV":i&&typeof this.module.createFullSolarSystemIVBarycentric=="function"?this.simulation=this.module.createFullSolarSystemIVBarycentric(t):typeof this.module.createFullSolarSystemIV=="function"?this.simulation=this.module.createFullSolarSystemIV(t):(Le.warn("Full Solar System IV preset unavailable. Falling back to Sun-Earth-Moon."),this.simulation=this.module.createSunEarthMoon(t),a="sunEarthMoon");break;case"solarCentauriI":i&&typeof this.module.createSolarCentauriIBarycentric=="function"?this.simulation=this.module.createSolarCentauriIBarycentric(t):typeof this.module.createSolarCentauriI=="function"?this.simulation=this.module.createSolarCentauriI(t):(Le.warn("Sol-Centauri System preset unavailable. Falling back to Sun-Earth-Moon."),this.simulation=this.module.createSunEarthMoon(t),a="sunEarthMoon");break;case"playableSolarSystem":typeof this.module.createPlayableSolarSystem=="function"?this.simulation=this.module.createPlayableSolarSystem(t):(Le.warn("Playable Solar System preset unavailable. Falling back to Sun-Earth-Moon."),this.simulation=this.module.createSunEarthMoon(t),a="sunEarthMoon");break;case"jupiterSystem":this.simulation=this.module.createJupiterSystem(t);break;case"saturnSystem":this.simulation=this.module.createSaturnSystem(t);break;case"alphaCentauri":this.simulation=this.module.createAlphaCentauri(t);break;case"trappist1":this.simulation=this.module.createTrappist1(t);break;case"binaryPulsar":this.simulation=this.module.createBinaryPulsar(t);break;case"asteroidBelt":{const o=n??5e3;typeof this.module.createAsteroidBelt=="function"?this.simulation=this.module.createAsteroidBelt(t,o):(Le.warn("Asteroid Belt preset unavailable. Falling back to Sun-Earth-Moon."),this.simulation=this.module.createSunEarthMoon(t),a="sunEarthMoon");break}case"starCluster":{const o=n??2e3;typeof this.module.createStarCluster=="function"?this.simulation=this.module.createStarCluster(t,o):(Le.warn("Star Cluster preset unavailable. Falling back to Sun-Earth-Moon."),this.simulation=this.module.createSunEarthMoon(t),a="sunEarthMoon");break}case"stressTest":{const o=r?.stars??30,l=r?.planets??100,c=r?.asteroids??0;typeof this.module.createStressTest=="function"?this.simulation=this.module.createStressTest(t,o,l,c):(Le.warn("Stress Test preset unavailable. Falling back to Sun-Earth-Moon."),this.simulation=this.module.createSunEarthMoon(t),a="sunEarthMoon");break}default:this.simulation=this.module.createSunEarthMoon(t)}this.simulation.setDt(ee.adminDefaults.dt),this.simulation.setSubsteps(ee.adminDefaults.substeps),Le.info(`Loaded preset: ${a} (${this.simulation.bodyCount()} bodies, dt=${ee.adminDefaults.dt}s)`)}addBody(e){if(!this.simulation)throw new Error("No simulation");let t;return e.type==="star"?t=this.simulation.addStar(e.name,e.mass,e.radius):t=this.simulation.addPlanet(e.name,e.mass,e.radius,Math.sqrt(e.x*e.x+e.z*e.z),Math.sqrt(e.vx*e.vx+e.vz*e.vz)),Le.info(`Added body: ${e.name} (id: ${t})`),t}addBodyDirect(e){if(!this.simulation)throw new Error("No simulation");const t=this.simulation.addBody(e.name,e.bodyType,e.mass,e.radius,e.x,e.y,e.z,e.vx,e.vy,e.vz);return Le.info(`Added body: ${e.name} (id: ${t}, type: ${e.bodyType})`),t}removeBody(e){if(!this.simulation)return!1;const t=this.simulation.removeBody(e);return t?Le.info(`Removed body id=${e}`):Le.warn(`Body id=${e} not found`),t}dispose(){this.simulation&&this.simulation.free()}}class i0{container;messageList;input;messages=[];nextId=1;network;isOpen=!0;isFocused=!1;unreadCount=0;unreadBadge;onToggleTouchControls;MAX_MESSAGES=10;localName=`Player${Math.floor(Math.random()*9e3)+1e3}`;constructor(e){this.network=e,this.container=this.createUI(),document.body.appendChild(this.container),this.setupKeyboardShortcuts(),this.addSystemMessage("Welcome to the chat. Type /help for a list of available commands. Press I for keybinds."),this.setOpen(!1)}createUI(){const e=document.createElement("div");e.id="chat-panel",e.innerHTML=`
            <div class="chat-header">
                <span class="chat-title">Chat</span>
                <span class="chat-unread" aria-hidden="true"></span>
                <button class="chat-toggle" title="Toggle (T)">−</button>
            </div>
            <div class="chat-messages" id="chat-messages"></div>
            <div class="chat-input-container">
                <input type="text" id="chat-input" placeholder="Type a message..." maxlength="200">
            </div>
        `;const t=document.createElement("style");return t.textContent=`
            #chat-panel {
                position: fixed;
                bottom: 16px;
                left: 16px;
                width: 300px;
                background: ${O.surface.panelBg};
                -webkit-backdrop-filter: blur(16px) saturate(180%);
                backdrop-filter: blur(16px) saturate(180%);
                border: 1px solid ${O.surface.cardBorder};
                box-shadow: ${O.surface.panelShadow};
                border-radius: 12px;
                color: ${O.text.primary};
                font-family: 'Segoe UI', system-ui, sans-serif;
                font-size: 13px;
                z-index: 150;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                transition: height 0.2s, opacity 0.2s;
            }
            
            #chat-panel.minimized {
                height: 32px !important;
            }
            
            #chat-panel.minimized .chat-messages,
            #chat-panel.minimized .chat-input-container {
                display: none;
            }
            
            .chat-header {
                display: flex;
                justify-content: flex-start;
                align-items: center;
                padding: 7px 10px;
                gap: 8px;
                background: ${O.surface.headerBg};
                border-bottom: 1px solid ${O.surface.cardBorder};
                font-weight: 500;
                cursor: pointer;
            }

            .chat-title {
                display: inline-flex;
                align-items: center;
                gap: 6px;
            }

            .chat-unread {
                display: none;
                align-items: center;
                justify-content: center;
                min-width: 18px;
                height: 18px;
                padding: 0 6px;
                border-radius: 999px;
                background: ${O.accent.primaryMuted};
                color: #04121f;
                font-size: 11px;
                font-weight: 700;
                letter-spacing: 0.2px;
                box-shadow: 0 0 0 1px rgba(4, 18, 31, 0.35), 0 6px 12px ${O.surface.panelShadow};
            }

            .chat-unread.is-visible {
                display: inline-flex;
            }
            
            .chat-toggle {
                background: none;
                border: none;
                color: ${O.text.disabled};
                font-size: 16px;
                cursor: pointer;
                padding: 0 5px;
                line-height: 1;
                margin-left: auto;
            }
            
            .chat-toggle:hover {
                color: ${O.text.primary};
            }
            
            .chat-messages {
                height: 170px;
                overflow-y: auto;
                padding: 8px 10px;
                scrollbar-width: thin;
                scrollbar-color: ${O.accent.primaryMuted} rgba(0, 0, 0, 0.2);
            }

            .chat-messages::-webkit-scrollbar {
                width: 6px;
            }

            .chat-messages::-webkit-scrollbar-track {
                background: rgba(0, 0, 0, 0.2);
                border-radius: 4px;
            }

            .chat-messages::-webkit-scrollbar-thumb {
                background: ${O.accent.primaryMuted};
                border-radius: 4px;
                border: 1px solid rgba(0, 0, 0, 0.3);
            }

            .chat-messages::-webkit-scrollbar-thumb:hover {
                background: ${O.accent.primary};
            }
            
            .chat-message {
                margin-bottom: 6px;
                line-height: 1.4;
                word-wrap: break-word;
            }
            
            .chat-message .sender {
                font-weight: 600;
                color: ${O.accent.primary};
            }
            
            .chat-message.system {
                color: ${O.text.disabled};
                font-style: italic;
            }
            
            .chat-message.system .sender {
                color: ${O.accent.secondary};
            }

            .chat-message.admin {
                color: ${O.text.secondary};
            }

            .chat-message.admin .sender {
                color: ${O.status.error};
                font-weight: 700;
            }
            
            .chat-message .text {
                color: ${O.text.secondary};
            }
            
            .chat-message .time {
                font-size: 10px;
                color: ${O.text.hint};
                margin-left: 8px;
            }
            
            .chat-input-container {
                padding: 6px 10px 8px;
                border-top: 1px solid ${O.surface.cardBorder};
            }
            
            #chat-input {
                width: 100%;
                background: ${O.surface.inputBg};
                border: 1px solid ${O.surface.cardBorder};
                border-radius: 5px;
                color: ${O.text.primary};
                padding: 4px 8px;
                font-size: 13px;
            }
            
            #chat-input:focus {
                outline: none;
                border-color: ${O.accent.primary};
            }
            
            #chat-input::placeholder {
                color: ${O.text.hint};
            }
        `,document.head.appendChild(t),this.messageList=e.querySelector("#chat-messages"),this.input=e.querySelector("#chat-input"),this.unreadBadge=e.querySelector(".chat-unread")??void 0,this.setupEventListeners(e),e}setupEventListeners(e){const t=e.querySelector(".chat-toggle"),i=e.querySelector(".chat-header");t?.addEventListener("click",n=>{n.stopPropagation(),this.toggle()}),i?.addEventListener("click",()=>{this.toggle()}),this.input.addEventListener("focus",()=>{this.isFocused=!0}),this.input.addEventListener("blur",()=>{this.isFocused=!1}),this.input.addEventListener("keydown",n=>{n.key==="Enter"&&(n.preventDefault(),this.sendMessage()),n.key==="Escape"&&(n.preventDefault(),this.minimizeAndBlur()),n.stopPropagation()})}setupKeyboardShortcuts(){window.addEventListener("keydown",e=>{if(e.key==="Escape"&&this.isFocused){this.minimizeAndBlur();return}this.isFocused||((e.key==="t"||e.key==="T")&&(e.preventDefault(),this.setOpen(!0),this.input.focus()),e.key==="Enter"&&this.isOpen&&this.input.focus())})}toggle(){this.setOpen(!this.isOpen)}setOpen(e){this.isOpen=e,this.container.classList.toggle("minimized",!this.isOpen),this.isOpen&&(this.unreadCount=0,this.updateUnreadBadge());const t=this.container.querySelector(".chat-toggle");t&&(t.textContent=this.isOpen?"−":"+")}minimizeAndBlur(){this.isFocused&&this.input.blur(),this.isOpen&&this.setOpen(!1)}sendMessage(){const e=this.input.value.trim();if(!(!e||e.length>200)){if(e.startsWith("/")&&this.handleLocalCommand(e)){this.input.value="";return}this.network?.isConnected()?this.network.sendChat(this.localName,e):(this.addMessage({id:this.nextId++,sender:this.localName,text:e,timestamp:Date.now(),isSystem:!1}),Le.warn("Chat message not sent: not connected to server")),this.input.value=""}}handleLocalCommand(e){const t=e.slice(1).trim(),[i]=t.split(/\s+/);switch(i?.toLowerCase()){case"mobile":{if(this.onToggleTouchControls){const r=this.onToggleTouchControls();this.addSystemMessage(r.message)}else this.addSystemMessage("Touch controls not available.");return!0}default:return!1}}addMessage(e){this.messages.push(e),this.messages.length>this.MAX_MESSAGES&&this.messages.shift(),this.isOpen||(this.unreadCount=Math.min(99,this.unreadCount+1),this.updateUnreadBadge()),this.renderMessages()}updateUnreadBadge(){if(this.unreadBadge){if(this.unreadCount<=0){this.unreadBadge.textContent="",this.unreadBadge.classList.remove("is-visible");return}this.unreadBadge.textContent=this.unreadCount>=99?"99+":`${this.unreadCount}`,this.unreadBadge.classList.add("is-visible")}}addSystemMessage(e){this.addMessage({id:this.nextId++,sender:"System",text:e,timestamp:Date.now(),isSystem:!0})}renderMessages(){this.messageList.innerHTML=this.messages.map(e=>{const t=new Date(e.timestamp).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});return`
                <div class="chat-message ${e.isSystem?"system":""} ${e.sender==="Admin"?"admin":""}">
                    <span class="sender">${this.escapeHtml(e.sender)}:</span>
                    <span class="text">${this.escapeHtml(e.text)}</span>
                    <span class="time">${t}</span>
                </div>
            `}).join(""),this.messageList.scrollTop=this.messageList.scrollHeight}escapeHtml(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}onServerMessage(e,t){this.addMessage({id:this.nextId++,sender:e,text:t,timestamp:Date.now(),isSystem:e==="System"})}setPlayersList(e){if(e.length===0){this.addSystemMessage("Current players: none");return}this.addSystemMessage(`Current players: ${e.join(", ")}`)}setLocalName(e){const t=e.trim();t.length>0&&(this.localName=t.slice(0,20))}setTouchControlsCallback(e){this.onToggleTouchControls=e}openForInput(){this.setOpen(!0),this.input.focus()}}class n0{container;physics;timeController;network;onPresetChange;onSimModeChange;onRingGeneratorLoadRequest;onRingGeneratorApply;onRingGeneratorExport;currentRingProfile={stops:[],baseOpacity:1,scatteringG:.3};isOpen=!1;config={timeScale:ee.adminDefaults.timeScale,tickRate:ee.adminDefaults.tickRate,forceMethod:ee.adminDefaults.forceMethod,theta:ee.adminDefaults.theta,substeps:ee.adminDefaults.substeps,simMode:ee.adminDefaults.simMode,hybridMaxSteps:ee.adminDefaults.hybridMaxSteps,hybridBudgeted:ee.adminDefaults.hybridBudgeted,closeEncounterIntegrator:ee.adminDefaults.closeEncounterIntegrator,closeEncounterHillFactor:ee.adminDefaults.closeEncounterHillFactor,closeEncounterTidalRatio:ee.adminDefaults.closeEncounterTidalRatio,closeEncounterJerkNorm:ee.adminDefaults.closeEncounterJerkNorm,closeEncounterMaxSubsetSize:ee.adminDefaults.closeEncounterMaxSubsetSize,closeEncounterMaxTrialSubsteps:ee.adminDefaults.closeEncounterMaxTrialSubsteps,closeEncounterRk45AbsTol:ee.adminDefaults.closeEncounterRk45AbsTol,closeEncounterRk45RelTol:ee.adminDefaults.closeEncounterRk45RelTol,closeEncounterGaussRadauMaxIters:ee.adminDefaults.closeEncounterGaussRadauMaxIters,closeEncounterGaussRadauTol:ee.adminDefaults.closeEncounterGaussRadauTol};constructor(e,t,i,n,r,a,o,l){this.physics=e,this.timeController=t,this.network=i,this.onPresetChange=n,this.onSimModeChange=r,this.onRingGeneratorLoadRequest=a,this.onRingGeneratorApply=o,this.onRingGeneratorExport=l,this.container=this.createUI(),document.body.appendChild(this.container),this.applyServerSettings(this.defaultAdminState()),this.setupKeyboardShortcut(),this.setupRingGeneratorEvents()}defaultAdminState(){const e=ee.adminDefaults;return{baseEpoch:e.baseEpoch,dt:e.dt,substeps:e.substeps,forceMethod:e.forceMethod,theta:e.theta,timeScale:e.timeScale,paused:e.paused,simMode:e.simMode,hybridMaxSteps:e.hybridMaxSteps,hybridBudgeted:e.hybridBudgeted,closeEncounterIntegrator:e.closeEncounterIntegrator,closeEncounterHillFactor:e.closeEncounterHillFactor,closeEncounterTidalRatio:e.closeEncounterTidalRatio,closeEncounterJerkNorm:e.closeEncounterJerkNorm,closeEncounterMaxSubsetSize:e.closeEncounterMaxSubsetSize,closeEncounterMaxTrialSubsteps:e.closeEncounterMaxTrialSubsteps,closeEncounterRk45AbsTol:e.closeEncounterRk45AbsTol,closeEncounterRk45RelTol:e.closeEncounterRk45RelTol,closeEncounterGaussRadauMaxIters:e.closeEncounterGaussRadauMaxIters,closeEncounterGaussRadauTol:e.closeEncounterGaussRadauTol}}setPaused(e){const t=document.getElementById("admin-pause-btn");t&&(t.textContent=e?"Resume Simulation":"Pause Simulation",t.classList.toggle("admin-btn-warning",e))}getHybridMaxSteps(){return this.config.hybridMaxSteps}isHybridBudgeted(){return this.config.hybridBudgeted}createUI(){const e=document.createElement("div");e.id="admin-panel",e.innerHTML=`
            <div class="admin-header">
                <h2>Admin</h2>
                <button class="admin-close" title="Close (&#96;)">&times;</button>
            </div>
            
            <div class="opt-tabs admin-tabs">
                <button class="opt-tab active" data-tab="admin-general">General</button>
                <button class="opt-tab" data-tab="admin-close">Close Encounters</button>
                <button class="opt-tab" data-tab="admin-ring">Ring Gen</button>
            </div>

            <div class="opt-content admin-content active" id="tab-admin-general">
                <section class="admin-section">
                    <h3>Presets</h3>
                    <div class="admin-field">
                        <label>Load Preset</label>
                        <select id="admin-preset">
                            <option value="worldBuilder" >World Builder</option>
                            <option value="sunEarthMoon" >Sun-Earth-Moon</option>
                            <option value="innerSolarSystem" >Inner Solar System</option>
                            <option value="fullSolarSystemII" >Full Solar System II (J2000)</option>
                            <option value="fullSolarSystemIII" >Full Solar System III (2026)</option>
                            <option value="fullSolarSystemIV" selected>Full Solar System IV (2026, SSB)</option>
                            <option value="solarCentauriI" >Sol-Centauri System (2026)</option>
                            <option value="playableSolarSystem">Playable Solar System</option>
                            <option value="jupiterSystem">Jupiter System</option>
                            <option value="saturnSystem">Saturn System</option>
                            <option value="alphaCentauri">Alpha Centauri</option>
                            <option value="trappist1">TRAPPIST-1</option>
                            <option value="binaryPulsar">Binary Pulsar</option>
                            <option value="integratorTest1">Integrator Test 1 (Two-Body)</option>
                            <option value="integratorTest2">Integrator Test 2 (Jupiter-Saturn)</option>
                            <option value="integratorTest3">Integrator Test 3 (Close Encounter)</option>
                            <option value="asteroidBelt">Asteroid Belt (5000+ bodies)</option>
                            <option value="starCluster">Star Cluster (2000 stars)</option>
                            <option value="stressTest">Stress Test (Benchmark)</option>
                        </select>
                    </div>
                    <div class="admin-field" id="barycentric-field">
                        <label class="opt-toggle">
                            <input type="checkbox" id="admin-barycentric" checked>
                            <span>Barycentric Mode</span>
                        </label>
                        <div class="admin-hint">Shift to center-of-mass frame</div>
                    </div>
                    <div class="admin-field" id="body-count-field" style="display: none;">
                        <label>Number of Bodies</label>
                        <input type="number" id="admin-body-count" min="0" step="1" value="5000">
                        <div class="admin-hint" id="body-count-hint">More bodies = slower simulation</div>
                    </div>
                    <div id="stress-test-fields" style="display: none;">
                        <div class="admin-field">
                            <label>Stars</label>
                            <input type="number" id="stress-stars" min="1" max="200" step="1" value="30">
                        </div>
                        <div class="admin-field">
                            <label>Planets</label>
                            <input type="number" id="stress-planets" min="0" max="2000" step="1" value="1000">
                        </div>
                        <div class="admin-field">
                            <label>Asteroids</label>
                            <input type="number" id="stress-asteroids" min="0" max="10000" step="1" value="0">
                        </div>
                    </div>
                    <button class="admin-btn" id="admin-load-preset">Load Preset</button>
                </section>
                
                <section class="admin-section">
                    <h3>Simulation</h3>
                    
                    <div class="admin-field">
                        <label>Time Warp</label>
                        <select id="admin-time-warp">
                            <!-- Populated by JS -->
                        </select>
                    </div>

                    <div class="admin-field">
                        <label>Base Epoch (UTC)</label>
                        <input type="text" id="admin-base-epoch" value="${ee.adminDefaults.baseEpoch}">
                    </div>

                    <div class="admin-field">
                        <label>Timestep (seconds)</label>
                        <input type="number" id="admin-dt" value="${ee.adminDefaults.dt}" min="0.001" step="0.001">
                    </div>

                    <div class="admin-field">
                        <label>Simulation Mode</label>
                        <select id="admin-sim-mode">
                            <option value="tick">Tick-Scaled (Lightweight)</option>
                            <option value="accumulator">Fixed-Delta (Accurate)</option>
                            <option value="hybrid">Hybrid (Balanced)</option>
                        </select>
                    </div>

                    <div id="hybrid-settings" style="display: none;">
                        <div class="admin-field">
                            <label>Max Substeps</label>
                            <input type="number" id="admin-hybrid-max-steps" value="${ee.adminDefaults.hybridMaxSteps}" min="1" step="1">
                        </div>
                        <div class="admin-field">
                            <label class="opt-toggle">
                                <input type="checkbox" id="admin-hybrid-budgeted" >
                                <span>Budgeted (Experimental)</span>
                            </label>
                        </div>
                    </div>

                    <div class="admin-field">
                        <label>Substeps</label>
                        <input type="number" id="admin-substeps" value="${ee.adminDefaults.substeps}" min="1" max="16">
                    </div>
                    
                    <div class="admin-field">
                        <label>Force Method</label>
                        <select id="admin-force-method">
                            <option value="direct">Direct Sum O(N²)</option>
                            <option value="barnes-hut">Barnes-Hut O(N log N)</option>
                        </select>
                    </div>
                    
                    <div class="admin-field" id="theta-field">
                        <label>Barnes-Hut θ</label>
                        <input type="number" id="admin-theta" value="${ee.adminDefaults.theta}" min="0.1" max="2" step="0.1">
                    </div>
                </section>
                
                <section class="admin-section">
                    <h3>Actions</h3>
                    <button class="admin-btn" id="admin-apply">Apply Settings</button>
                    <button class="admin-btn" id="admin-pause-btn">Pause Simulation</button>
                    <button class="admin-btn admin-btn-warning" id="admin-reset">Reset Simulation</button>
                </section>
            </div>

            <div class="opt-content admin-content" id="tab-admin-close" style="display: none;">
                <section class="admin-section">
                    <h3>Switching</h3>
                    <div class="admin-grid-two">
                        <div class="admin-field">
                            <label>Integrator</label>
                            <select id="admin-close-encounter">
                                <option value="none" selected>None (Verlet only)</option>
                                <option value="gauss-radau" >Gauss-Radau 5th</option>
                                <option value="rk45" >Adaptive RK45</option>
                            </select>
                        </div>
                        <div class="admin-field">
                            <label>Hill Radius Factor</label>
                            <input type="number" id="admin-close-hill" value="${ee.adminDefaults.closeEncounterHillFactor}" min="0.1" step="0.1">
                        </div>
                        <div class="admin-field">
                            <label>Tidal Ratio Threshold</label>
                            <input type="number" id="admin-close-tidal" value="${ee.adminDefaults.closeEncounterTidalRatio}" min="0" step="0.0001">
                            <div class="admin-hint">|a_perturber| / |a_primary|</div>
                        </div>
                        <div class="admin-field">
                            <label>Normalized Jerk Threshold</label>
                            <input type="number" id="admin-close-jerk" value="${ee.adminDefaults.closeEncounterJerkNorm}" min="0" step="0.01">
                            <div class="admin-hint">|jerk| × dt / |accel|</div>
                        </div>
                        <div class="admin-field">
                            <label>Max Subset Size</label>
                            <input type="number" id="admin-close-max-subset" value="${ee.adminDefaults.closeEncounterMaxSubsetSize}" min="1" step="1">
                        </div>
                        <div class="admin-field">
                            <label>Max Trial Substeps</label>
                            <input type="number" id="admin-close-max-substeps" value="${ee.adminDefaults.closeEncounterMaxTrialSubsteps}" min="1" step="1">
                        </div>
                    </div>
                </section>

                <section class="admin-section">
                    <h3>RK45</h3>
                    <div class="admin-grid-two">
                        <div class="admin-field">
                            <label>Absolute Tolerance</label>
                            <input type="number" id="admin-close-rk45-abs" value="${ee.adminDefaults.closeEncounterRk45AbsTol}" min="0" step="0.0001">
                        </div>
                        <div class="admin-field">
                            <label>Relative Tolerance</label>
                            <input type="number" id="admin-close-rk45-rel" value="${ee.adminDefaults.closeEncounterRk45RelTol}" min="0" step="0.000001">
                        </div>
                    </div>
                </section>

                <section class="admin-section">
                    <h3>Gauss-Radau</h3>
                    <div class="admin-grid-two">
                        <div class="admin-field">
                            <label>Max Iterations</label>
                            <input type="number" id="admin-close-gr-iters" value="${ee.adminDefaults.closeEncounterGaussRadauMaxIters}" min="1" step="1">
                        </div>
                        <div class="admin-field">
                            <label>Convergence Tolerance</label>
                            <input type="number" id="admin-close-gr-tol" value="${ee.adminDefaults.closeEncounterGaussRadauTol}" min="0" step="0.000000001">
                        </div>
                    </div>
                    <button class="admin-btn" id="admin-apply-close">Apply Close-Encounter Settings</button>
                </section>
            </div>

            <div class="opt-content admin-content" id="tab-admin-ring" style="display: none;">
                <section class="admin-section">
                    <h3>Ring Generator</h3>
                    <div class="admin-field">
                        <button id="admin-ring-gen-load" class="admin-btn">Load Current Followed Body</button>
                    </div>
                    <div class="admin-field">
                        <label>Base Opacity</label>
                        <div class="admin-slider-row">
                            <input type="range" id="admin-ring-gen-opacity" min="0" max="2" step="0.05" value="1.0">
                            <span id="admin-ring-gen-opacity-val">1.0</span>
                        </div>
                    </div>
                    <div class="admin-field">
                        <label>Scattering (g)</label>
                        <div class="admin-slider-row">
                            <input type="range" id="admin-ring-gen-g" min="-0.99" max="0.99" step="0.01" value="0.3">
                            <span id="admin-ring-gen-g-val">0.3</span>
                        </div>
                    </div>
                    <div class="admin-field" style="margin-top:10px;">
                        <label style="display:flex;justify-content:space-between;align-items:center;">
                            <span>Gradient Stops</span>
                            <button id="admin-ring-gen-add-stop" class="admin-btn" style="padding:2px 6px; font-size:10px; width:auto; margin-bottom:0;">+ Add Stop</button>
                        </label>
                        <div id="admin-ring-gen-stops" style="display:flex;flex-direction:column;gap:5px;max-height:200px;overflow-y:auto;border:1px solid rgba(255,255,255,0.1);padding:5px;background:rgba(0,0,0,0.3); border-radius:4px;">
                            <!-- Stops injected here -->
                        </div>
                    </div>
                    <div class="admin-grid-two" style="margin-top:10px;">
                        <button id="admin-ring-gen-apply" class="admin-btn">Apply (Preview)</button>
                        <button id="admin-ring-gen-export" class="admin-btn">Export Code</button>
                    </div>
                </section>
            </div>
        `;const t=document.createElement("style");t.textContent=`
            #admin-panel {
                position: fixed;
                top: 80px;
                right: 40px;
                width: 248px;
                background: ${O.surface.panelBg};
                -webkit-backdrop-filter: blur(16px) saturate(180%);
                backdrop-filter: blur(16px) saturate(180%);
                border: 1px solid ${O.surface.cardBorder};
                box-shadow: ${O.surface.panelShadow};
                border-radius: 12px;
                color: ${O.text.primary};
                font-family: 'Segoe UI', system-ui, sans-serif;
                font-size: 13px;
                z-index: 200;
                display: none;
                flex-direction: column;
                overflow: hidden;
            }

            @media (max-width: 768px) {
                #admin-panel {
                    top: 50% !important;
                    left: 50% !important;
                    right: auto !important;
                    bottom: auto !important;
                    transform: translate(-50%, -50%) !important;
                    width: 90% !important;
                    max-width: 400px;
                    max-height: 80vh;
                    overflow-y: auto;
                }
            }
            
            #admin-panel.open {
                display: flex;
            }
            
            .admin-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 12px;
                border-bottom: 1px solid ${O.surface.cardBorder};
                background: ${O.surface.headerBg};
                cursor: move;
                user-select: none;
            }
            
            .admin-header h2 {
                font-size: 13px;
                font-weight: 600;
                margin: 0;
                color: ${O.accent.primary};
            }
            
            .admin-close {
                background: none;
                border: none;
                color: ${O.text.disabled};
                font-size: 20px;
                cursor: pointer;
                padding: 0 5px;
                line-height: 1;
            }
            
            .admin-close:hover {
                color: ${O.text.primary};
            }
            
            .admin-content {
                padding: 10px 12px;
            }

            .opt-tabs {
                display: flex;
                background: rgba(0, 0, 0, 0.2);
                border-bottom: 1px solid ${O.surface.cardBorder};
            }

            .opt-tab {
                flex: 1;
                background: none;
                border: none;
                color: ${O.text.subtle};
                padding: 8px 0;
                font-size: 11px;
                font-weight: 600;
                cursor: pointer;
                border-bottom: 2px solid transparent;
                transition: color 0.2s, border-color 0.2s;
            }

            .opt-tab:hover {
                color: ${O.text.primary};
                background: ${O.surface.buttonBg};
            }

            .opt-tab.active {
                color: ${O.accent.primary};
                border-bottom-color: ${O.accent.primary};
            }

            .opt-content { 
                padding: 10px 12px; 
                overflow-y: auto;
                max-height: calc(100vh - 120px);
            }
            .opt-content.active { display: block; }
            
            .admin-section {
                margin-bottom: 10px;
            }
            
            .admin-section:last-child {
                margin-bottom: 0;
            }
            
            .admin-section h3 {
                font-size: 9px;
                font-weight: 600;
                color: ${O.text.disabled};
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin: 0 0 8px 0;
            }
            
            .admin-field {
                margin: 6px 0 4px 0;
            }
            
            .admin-field label {
                display: block;
                font-size: 10px;
                color: ${O.text.subtle};
                margin-bottom: 4px;
            }
            
            .admin-field input,
            .admin-field select {
                width: 100%;
                background: ${O.surface.inputBg};
                border: 1px solid ${O.surface.cardBorder};
                border-radius: 4px;
                color: ${O.text.primary};
                padding: 5px 6px;
                font-size: 11px;
            }

            .admin-field input[type="range"] {
                padding: 0;
                height: 4px;
                accent-color: ${O.accent.primary};
            }

            .opt-toggle {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 6px 0;
                cursor: pointer;
            }

            .opt-toggle input[type="checkbox"] {
                width: 14px;
                height: 14px;
                accent-color: ${O.accent.primary};
                margin: 0;
            }

            .opt-toggle span {
                font-size: 11px;
                color: ${O.text.secondary};
            }

            .admin-slider-row {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-top: 4px;
            }

            .admin-slider-row span {
                min-width: 70px;
                text-align: right;
                font-size: 11px;
                color: ${O.text.muted};
                font-variant-numeric: tabular-nums;
            }

            .admin-hint {
                margin-top: 4px;
                font-size: 11px;
                color: ${O.text.subtle};
                font-variant-numeric: tabular-nums;
            }
            
            .admin-field input:focus,
            .admin-field select:focus {
                outline: none;
                border-color: ${O.accent.primary};
            }
            
            .admin-btn {
                width: 100%;
                background: rgba(79, 195, 247, 0.2);
                border: 1px solid ${O.accent.primaryMuted};
                border-radius: 6px;
                color: ${O.text.highContrast};
                padding: 8px;
                font-size: 11px;
                font-weight: 600;
                cursor: pointer;
                margin-bottom: 6px;
                transition: background 0.2s, border-color 0.2s, color 0.2s;
                box-sizing: border-box;
            }
            
            .admin-btn:hover {
                background: rgba(79, 195, 247, 0.3);
            }
            
            .admin-btn-warning {
                background: ${O.status.dangerBg};
                border-color: ${O.status.dangerBorder};
                color: ${O.status.dangerText};
            }

            .admin-grid-two {
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: 6px 8px;
            }
            
            #theta-field {
                display: none;
            }
            
            #theta-field.visible {
                display: block;
            }
        `,document.head.appendChild(t);const i=e.querySelector("#admin-time-warp");return this.timeController.getSpeedLevels().forEach((r,a)=>{const o=document.createElement("option");o.value=r.sim.toString(),o.textContent=r.label,a===this.timeController.getSpeedIndex()&&(o.selected=!0),i.appendChild(o)}),this.setupEventListeners(e),this.setupTabs(e),e}setupEventListeners(e){e.querySelector(".admin-close")?.addEventListener("click",()=>{this.close()}),this.setupDrag(e);const t=e.querySelector("#admin-force-method"),i=e.querySelector("#theta-field");t?.addEventListener("change",()=>{i.classList.toggle("visible",t.value==="barnes-hut")});const n=e.querySelector("#admin-sim-mode"),r=e.querySelector("#hybrid-settings");n?.addEventListener("change",()=>{r&&(r.style.display=n.value==="hybrid"?"block":"none")}),e.querySelector("#admin-apply")?.addEventListener("click",()=>{this.applySettings()}),e.querySelector("#admin-apply-close")?.addEventListener("click",()=>{this.applySettings()}),e.querySelector("#admin-load-preset")?.addEventListener("click",()=>{const p=e.querySelector("#admin-preset"),g=e.querySelector("#admin-barycentric"),y=e.querySelector("#admin-body-count");if(!p)return;const m=p.options[p.selectedIndex].text,u=g?.checked??!1,v=p.value;let _;if(v==="asteroidBelt"||v==="starCluster"){const T=y?parseInt(y.value,10):NaN;_=Number.isFinite(T)&&T>=0?T:void 0}let x;if(v==="stressTest"){const T=e.querySelector("#stress-stars"),C=e.querySelector("#stress-planets"),A=e.querySelector("#stress-asteroids");x={stars:Math.max(1,parseInt(T?.value??"30",10)||30),planets:Math.max(0,parseInt(C?.value??"100",10)||0),asteroids:Math.max(0,parseInt(A?.value??"0",10)||0)}}this.onPresetChange?.(v,m,u,_,x)});const a=e.querySelector("#admin-preset"),o=e.querySelector("#barycentric-field"),l=e.querySelector("#body-count-field"),c=e.querySelector("#admin-body-count"),h=e.querySelector("#body-count-hint"),d=e.querySelector("#stress-test-fields"),f=()=>{if(!a)return;const p=a.value;o&&(o.style.display="block"),d&&(d.style.display=p==="stressTest"?"block":"none"),l&&c&&h&&(p==="asteroidBelt"?(l.style.display="block",c.value="5000",c.placeholder="5000",h.textContent="Asteroids in main belt (plus ~15 planets/dwarf planets)"):p==="starCluster"?(l.style.display="block",c.value="2000",c.placeholder="2000",h.textContent="Stars in Plummer sphere cluster"):l.style.display="none")};a?.addEventListener("change",f),f(),e.querySelector("#admin-pause-btn")?.addEventListener("click",()=>{this.timeController.togglePause(),this.network?.isConnected()&&this.network.sendPause(this.timeController.isPaused()),this.setPaused(this.timeController.isPaused())}),e.querySelector("#admin-reset")?.addEventListener("click",()=>{confirm("Reset simulation to default state?")&&this.resetSimulation()})}setupTabs(e){const t=e.querySelectorAll(".opt-tab"),i=e.querySelectorAll(".opt-content");t.forEach(n=>{n.addEventListener("click",()=>{const r=n.dataset.tab;t.forEach(a=>a.classList.toggle("active",a===n)),i.forEach(a=>{const o=a.id.replace("tab-","");a.style.display=o===r?"block":"none"})})})}setupKeyboardShortcut(){window.addEventListener("keydown",e=>{e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement||((e.key==="`"||e.code==="Backquote")&&this.toggle(),e.key==="Escape"&&this.isOpen&&this.close())})}toggle(){this.isOpen?this.close():this.open()}open(){this.isOpen=!0,this.container.classList.add("open")}close(){this.isOpen=!1,this.container.classList.remove("open")}applySettings(){const e=document.getElementById("admin-base-epoch").value,t=parseFloat(document.getElementById("admin-dt").value),i=parseInt(document.getElementById("admin-substeps").value),n=document.getElementById("admin-force-method").value,r=parseFloat(document.getElementById("admin-theta").value),a=document.getElementById("admin-sim-mode").value,o=parseInt(document.getElementById("admin-hybrid-max-steps").value,10),l=document.getElementById("admin-hybrid-budgeted").checked,c=document.getElementById("admin-close-encounter").value,h=parseFloat(document.getElementById("admin-close-hill").value),d=parseFloat(document.getElementById("admin-close-tidal").value),f=parseFloat(document.getElementById("admin-close-jerk").value),p=parseInt(document.getElementById("admin-close-max-subset").value,10),g=parseInt(document.getElementById("admin-close-max-substeps").value,10),y=parseFloat(document.getElementById("admin-close-rk45-abs").value),m=parseFloat(document.getElementById("admin-close-rk45-rel").value),u=parseInt(document.getElementById("admin-close-gr-iters").value,10),v=parseFloat(document.getElementById("admin-close-gr-tol").value),_=document.getElementById("admin-time-warp"),x=parseFloat(_.value);this.network?.isConnected()&&this.network.sendAdminSettings({baseEpoch:e,dt:t,substeps:i,forceMethod:n==="barnes-hut"?"barnes-hut":"direct",theta:r,timeScale:x,simMode:a,hybridMaxSteps:o,hybridBudgeted:l,closeEncounterIntegrator:c,closeEncounterHillFactor:h,closeEncounterTidalRatio:d,closeEncounterJerkNorm:f,closeEncounterMaxSubsetSize:p,closeEncounterMaxTrialSubsteps:g,closeEncounterRk45AbsTol:y,closeEncounterRk45RelTol:m,closeEncounterGaussRadauMaxIters:u,closeEncounterGaussRadauTol:v}),this.config.hybridMaxSteps=o,this.config.hybridBudgeted=l,this.physics.setTimeStep(t),this.physics.setSubsteps(i),n==="barnes-hut"?(this.physics.setTheta(r),this.physics.useBarnesHut()):this.physics.useDirectForce(),this.physics.setCloseEncounterIntegrator(c),this.physics.setCloseEncounterThresholds(h,d,f),this.physics.setCloseEncounterLimits(p,g),this.physics.setCloseEncounterRk45Tolerances(y,m),this.physics.setCloseEncounterGaussRadau(u,v),this.timeController.setPhysicsTimestep(t),this.timeController.setSpeedBySimRate(x),this.onSimModeChange?.(a),Le.info(`Applied settings: dt=${t}s, substeps=${i}, method=${n}, θ=${r}, mode=${a}`)}resetSimulation(){if(this.network?.isConnected())this.network.resetSimulation();else{this.physics.createPreset(ee.defaultPreset.id,BigInt(Date.now()),ee.defaultPreset.barycentric,void 0);const e=this.defaultAdminState();this.physics.setTimeStep(e.dt),this.physics.setSubsteps(e.substeps),e.forceMethod==="barnes-hut"?(this.physics.setTheta(e.theta),this.physics.useBarnesHut()):this.physics.useDirectForce(),this.physics.setCloseEncounterIntegrator(e.closeEncounterIntegrator),this.physics.setCloseEncounterThresholds(e.closeEncounterHillFactor,e.closeEncounterTidalRatio,e.closeEncounterJerkNorm),this.physics.setCloseEncounterLimits(e.closeEncounterMaxSubsetSize,e.closeEncounterMaxTrialSubsteps),this.physics.setCloseEncounterRk45Tolerances(e.closeEncounterRk45AbsTol,e.closeEncounterRk45RelTol),this.physics.setCloseEncounterGaussRadau(e.closeEncounterGaussRadauMaxIters,e.closeEncounterGaussRadauTol),this.timeController.setPhysicsTimestep(e.dt),this.timeController.setSpeedBySimRate(e.timeScale),this.onSimModeChange?.(e.simMode),this.applyServerSettings(e),Le.info(`Simulation reset to ${ee.defaultPreset.id}`)}this.close()}applyServerSettings(e){const t=document.getElementById("admin-dt"),i=document.getElementById("admin-substeps"),n=document.getElementById("admin-force-method"),r=document.getElementById("admin-theta"),a=document.getElementById("theta-field"),o=document.getElementById("admin-sim-mode"),l=document.getElementById("hybrid-settings"),c=document.getElementById("admin-hybrid-max-steps"),h=document.getElementById("admin-hybrid-budgeted"),d=document.getElementById("admin-time-warp"),f=document.getElementById("admin-close-encounter"),p=document.getElementById("admin-close-hill"),g=document.getElementById("admin-close-tidal"),y=document.getElementById("admin-close-jerk"),m=document.getElementById("admin-close-max-subset"),u=document.getElementById("admin-close-max-substeps"),v=document.getElementById("admin-close-rk45-abs"),_=document.getElementById("admin-close-rk45-rel"),x=document.getElementById("admin-close-gr-iters"),T=document.getElementById("admin-close-gr-tol");if(t&&(t.value=e.dt.toString()),i&&(i.value=e.substeps.toString()),n&&(n.value=e.forceMethod),r&&(r.value=e.theta.toString()),a&&a.classList.toggle("visible",e.forceMethod==="barnes-hut"),o&&(o.value=e.simMode,l&&(l.style.display=e.simMode==="hybrid"?"block":"none")),c&&(c.value=(e.hybridMaxSteps||ee.adminDefaults.hybridMaxSteps).toString()),h&&(h.checked=e.hybridBudgeted||!1),d){const C=e.timeScale.toString();Array.from(d.options).some(A=>A.value===C)?d.value=C:(this.timeController.setSpeedBySimRate(e.timeScale),d.value=this.timeController.getCurrentSpeed().sim.toString())}f&&(f.value=e.closeEncounterIntegrator),p&&(p.value=e.closeEncounterHillFactor.toString()),g&&(g.value=e.closeEncounterTidalRatio.toString()),y&&(y.value=e.closeEncounterJerkNorm.toString()),m&&(m.value=e.closeEncounterMaxSubsetSize.toString()),u&&(u.value=e.closeEncounterMaxTrialSubsteps.toString()),v&&(v.value=e.closeEncounterRk45AbsTol.toString()),_&&(_.value=e.closeEncounterRk45RelTol.toString()),x&&(x.value=e.closeEncounterGaussRadauMaxIters.toString()),T&&(T.value=e.closeEncounterGaussRadauTol.toString())}setupDrag(e){let t=0,i=0,n=0,r=0,a=!1;const o=c=>{if(!a)return;const h=c.clientX-t,d=c.clientY-i;e.style.left=`${n+h}px`,e.style.top=`${r+d}px`},l=()=>{a=!1,document.removeEventListener("mousemove",o),document.removeEventListener("mouseup",l)};e.addEventListener("mousedown",c=>{if(c.target.closest("input, select, button, textarea, label, summary, a, option, [contenteditable], .admin-tab-btn, .tab-btn")||c.button!==0)return;const d=e.getBoundingClientRect();t=c.clientX,i=c.clientY,n=d.left,r=d.top,e.style.left=`${d.left}px`,e.style.top=`${d.top}px`,e.style.right="auto",e.style.transform="none",a=!0,document.addEventListener("mousemove",o),document.addEventListener("mouseup",l)})}setupRingGeneratorEvents(){const e=this.container.querySelector("#admin-ring-gen-load"),t=this.container.querySelector("#admin-ring-gen-apply"),i=this.container.querySelector("#admin-ring-gen-export"),n=this.container.querySelector("#admin-ring-gen-add-stop"),r=this.container.querySelector("#admin-ring-gen-opacity"),a=this.container.querySelector("#admin-ring-gen-g");e?.addEventListener("click",()=>{this.onRingGeneratorLoadRequest&&this.onRingGeneratorLoadRequest()}),t?.addEventListener("click",()=>{this.syncRingGeneratorProfileFromUI(),this.onRingGeneratorApply&&this.onRingGeneratorApply(this.currentRingProfile)}),i?.addEventListener("click",()=>{this.syncRingGeneratorProfileFromUI(),this.onRingGeneratorExport&&this.onRingGeneratorExport(this.currentRingProfile)}),n?.addEventListener("click",()=>{this.currentRingProfile.stops.push({pos:.5,color:"#ffffff",alpha:1}),this.currentRingProfile.stops.sort((l,c)=>l.pos-c.pos),this.renderRingGeneratorStops()});const o=()=>{this.syncRingGeneratorProfileFromUI(),this.renderRingGeneratorStops()};r?.addEventListener("input",o),a?.addEventListener("input",o)}syncRingGeneratorProfileFromUI(){const e=this.container.querySelector("#admin-ring-gen-opacity"),t=this.container.querySelector("#admin-ring-gen-g"),i=this.container.querySelector("#admin-ring-gen-opacity-val"),n=this.container.querySelector("#admin-ring-gen-g-val");e&&t&&i&&n&&(this.currentRingProfile.baseOpacity=parseFloat(e.value),this.currentRingProfile.scatteringG=parseFloat(t.value),i.textContent=this.currentRingProfile.baseOpacity.toFixed(2),n.textContent=this.currentRingProfile.scatteringG.toFixed(2)),this.currentRingProfile.stops.sort((o,l)=>o.pos-l.pos);const r=this.container.querySelector("#admin-ring-gen-stops");if(!r)return;const a=r.querySelectorAll(".rg-stop-row");this.currentRingProfile.stops.forEach((o,l)=>{if(l<a.length){const c=a[l],h=c.querySelector(".rg-pos"),d=c.querySelector(".rg-col"),f=c.querySelector(".rg-alpha");o.pos=parseFloat(h.value),o.color=d.value,o.alpha=parseFloat(f.value)}})}renderRingGeneratorStops(){const e=this.container.querySelector("#admin-ring-gen-stops");e&&(e.innerHTML="",this.currentRingProfile.stops.forEach((t,i)=>{const n=document.createElement("div");n.className="rg-stop-row",n.style.display="flex",n.style.gap="5px",n.style.alignItems="center",n.innerHTML=`
                <input type="number" class="rg-pos" value="${t.pos.toFixed(3)}" step="0.01" min="0" max="1" style="width:50px; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); color:#fff; padding:2px; font-size:11px;" title="Position (0-1)">
                <input type="color" class="rg-col" value="${t.color}" style="width:24px; padding:0; border:none; cursor:pointer;" title="Color">
                <input type="number" class="rg-alpha" value="${t.alpha.toFixed(2)}" step="0.05" min="0" max="1" style="width:45px; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); color:#fff; padding:2px; font-size:11px;" title="Alpha (0-1)">
                <button class="rg-del admin-btn" style="padding:2px 6px; margin:0; width:auto; color:#ff6b6b; border-color:rgba(255,107,107,0.3);" title="Remove">✕</button>
            `,n.querySelector(".rg-del")?.addEventListener("click",()=>{this.currentRingProfile.stops.splice(i,1),this.renderRingGeneratorStops()}),n.querySelectorAll("input").forEach(r=>{r.addEventListener("change",()=>this.syncRingGeneratorProfileFromUI())}),e.appendChild(n)}))}setRingGeneratorProfile(e){this.currentRingProfile={baseOpacity:e.baseOpacity,scatteringG:e.scatteringG,stops:e.stops.map(a=>({...a}))};const t=this.container.querySelector("#admin-ring-gen-opacity"),i=this.container.querySelector("#admin-ring-gen-g"),n=this.container.querySelector("#admin-ring-gen-opacity-val"),r=this.container.querySelector("#admin-ring-gen-g-val");t&&i&&n&&r&&(t.value=this.currentRingProfile.baseOpacity.toString(),n.textContent=this.currentRingProfile.baseOpacity.toFixed(2),i.value=this.currentRingProfile.scatteringG.toString(),r.textContent=this.currentRingProfile.scatteringG.toFixed(2)),this.renderRingGeneratorStops()}}const $t=63241.077,zl=1e5,kl=1e6,_n=5e3,s0={...ee.optionsDefaults};class r0{container;isOpen=!1;options;onChange;onPresetChange;onPresetEdit;onFreeCamSpeedChange;onFreeCamSensitivityChange;onFreeCamRotationDampingChange;onSurfaceSpeedChange;onSurfaceSensitivityChange;onSurfaceRotationDampingChange;onSurfaceEyeHeightChange;onOrbitalRotationDampingChange;onOrbitalZoomDampingChange;onFovChange;onExperimentalChange;presetName;presetRenderScale=1;presetShadowQuality="Binary";cameraFov=ee.cameraDefaults.cameraFov;freeCamSpeed=ee.cameraDefaults.freeCamSpeedAuPerSec;freeCamSensitivity=ee.cameraDefaults.freeCamSensitivity;freeCamRotationDamping=ee.cameraDefaults.freeCamRotationDamping;surfaceSpeed=ee.cameraDefaults.surfaceSpeedMps;surfaceSensitivity=ee.cameraDefaults.surfaceSensitivity;surfaceRotationDamping=ee.cameraDefaults.surfaceRotationDamping;surfaceEyeHeight=ee.cameraDefaults.surfaceEyeHeightM;orbitalRotationDamping=ee.cameraDefaults.orbitalRotationDamping;orbitalZoomDamping=ee.cameraDefaults.orbitalZoomDamping;ignoreEvents=!1;experimentalOptions={flareFrequencyMode:"fixed",flareBrightness:1,flaresVisible:!0,fixedFlareRate:2,ringQuality:"HighQualityClose",useRealisticTextures:!0,globalIllumination:0,earthshineEnabled:!0};atmospheresCheckbox;orbitsCheckbox;starLabelsCheckbox;planetLabelsCheckbox;moonLabelsCheckbox;gridXYCheckbox;gridXZCheckbox;gridYZCheckbox;gridSpacingInput;gridSpacingValue;gridSizeInput;gridSizeValue;gridExtent=200;trailSlider;trailValue;presetSelect;presetRenderScaleInput;presetRenderScaleValue;presetShadowQualitySelect;axisLinesCheckbox;refPlaneCheckbox;refLineCheckbox;refPointCheckbox;flareFrequencySelect;flareBrightnessInput;flareBrightnessValue;flaresVisibleCheckbox;fixedFlareRateInput;fixedFlareRateValue;fixedFlareRateField;ringQualitySelect;realisticTexturesCheckbox;globalIlluminationInput;globalIlluminationValue;earthshineCheckbox;sliderToSpacing(e){const i=zl,n=Math.log10(.001),r=Math.log10(i),a=Math.max(0,Math.min(1,e));return Math.pow(10,n+(r-n)*a)}spacingToSlider(e){const i=zl,n=Math.log10(.001),r=Math.log10(i),a=Math.max(.001,Math.min(i,e));return(Math.log10(a)-n)/(r-n)}sliderToExtent(e){const i=kl,n=Math.log10(1),r=Math.log10(i),a=Math.max(0,Math.min(1,e));return Math.pow(10,n+(r-n)*a)}extentToSlider(e){const i=kl,n=Math.log10(1),r=Math.log10(i),a=Math.max(1,Math.min(i,e));return(Math.log10(a)-n)/(r-n)}freeCamSpeedInput;freeCamSpeedValue;freeCamSensitivityInput;freeCamSensitivityValue;freeCamRotationDampingInput;freeCamRotationDampingValue;surfaceSpeedInput;surfaceSpeedValue;surfaceSensitivityInput;surfaceSensitivityValue;surfaceRotationDampingInput;surfaceRotationDampingValue;surfaceEyeHeightInput;surfaceEyeHeightValue;orbitalRotationDampingInput;orbitalRotationDampingValue;orbitalZoomDampingInput;orbitalZoomDampingValue;fovInput;fovValue;constructor(e,t,i,n,r,a,o,l,c,h,d,f,p,g=ee.visualPresetDefault,y){this.onChange=e,this.onPresetChange=t,this.onPresetEdit=i,this.onFreeCamSpeedChange=n,this.onFreeCamSensitivityChange=r,this.onFreeCamRotationDampingChange=a,this.onSurfaceSpeedChange=o,this.onSurfaceSensitivityChange=l,this.onSurfaceRotationDampingChange=c,this.onSurfaceEyeHeightChange=h,this.onOrbitalRotationDampingChange=d,this.onOrbitalZoomDampingChange=f,this.onFovChange=p,this.onExperimentalChange=y,this.presetName=g,this.options={...s0},this.container=this.createUI(),this.cacheElements(),this.bindEvents(),this.syncUIFromOptions(),document.body.appendChild(this.container),this.setupKeyboardShortcut()}createUI(){const e=document.createElement("div");e.id="opt-panel",e.innerHTML=`
            <div class="opt-header">
                <h2>Options</h2>
                <button class="opt-close" title="Close (O)">&times;</button>
            </div>

            <div class="opt-tabs">
                <button class="opt-tab active" data-tab="graphics">Graphics</button>
                <button class="opt-tab" data-tab="camera">Camera</button>
                <button class="opt-tab" data-tab="experimental">Experimental</button>
            </div>

            <div class="opt-content active" id="tab-graphics">
                <section class="opt-section">
                    <h3>Preset</h3>
                    <div class="opt-field">
                        <label>Visual Quality</label>
                        <select id="opt-preset">
                            <option value="Low">Low</option>
                            <option value="High">High</option>
                            <option value="Ultra">Ultra</option>
                        </select>
                    </div>
                </section>

                <section class="opt-section">
                    <h3>Preset Tuning</h3>
                    <div class="opt-field">
                        <label>Render Scale</label>
                        <input type="range" id="opt-render-scale" min="0.1" max="100" step="0.05" value="1">
                        <span id="opt-render-scale-value">1.00x</span>
                    </div>
                    <div class="opt-field">
                        <label>Shadow Quality</label>
                        <select id="opt-shadow-quality">
                            <option value="Off">Off</option>
                            <option value="Binary">Binary</option>
                            <option value="Penumbra">Penumbra</option>
                        </select>
                    </div>
                </section>

                <section class="opt-section">
                    <h3>Display</h3>

                    <div class="opt-row">
                        <label class="opt-toggle">
                            <input type="checkbox" id="opt-atmospheres">
                            <span>Atmospheres</span>
                        </label>
                        <label class="opt-toggle">
                            <input type="checkbox" id="opt-orbits">
                            <span>Trails</span>
                        </label>
                    </div>

                    <details open style="margin-bottom: 8px;">
                        <summary style="cursor: pointer; font-size: 10px; font-weight: 600; color: rgba(255, 255, 255, 0.5); text-transform: uppercase; letter-spacing: 0.5px; outline: none; margin-bottom: 6px;">Labels</summary>
                        <div class="opt-row" style="margin-top: 6px;">
                            <label class="opt-toggle">
                                <input type="checkbox" id="opt-star-labels">
                                <span>Star</span>
                            </label>
                            <label class="opt-toggle">
                                <input type="checkbox" id="opt-planet-labels">
                                <span>Planet</span>
                            </label>
                            <label class="opt-toggle">
                                <input type="checkbox" id="opt-moon-labels">
                                <span>Moon</span>
                            </label>
                        </div>
                    </details>

                    <details style="margin-bottom: 8px;">
                        <summary style="cursor: pointer; font-size: 10px; font-weight: 600; color: rgba(255, 255, 255, 0.5); text-transform: uppercase; letter-spacing: 0.5px; outline: none; margin-bottom: 6px;">Grids</summary>
                        <div class="opt-row" style="margin-top: 6px;">
                            <label class="opt-toggle">
                                <input type="checkbox" id="opt-grid-xy">
                                <span>XY</span>
                            </label>
                            <label class="opt-toggle">
                                <input type="checkbox" id="opt-grid-xz">
                                <span>XZ</span>
                            </label>
                            <label class="opt-toggle">
                                <input type="checkbox" id="opt-grid-yz">
                                <span>YZ</span>
                            </label>
                        </div>

                        <div class="opt-field" style="margin-top: 6px;">
                            <label>Grid Spacing</label>
                            <input type="range" id="opt-grid-spacing" min="0" max="1" step="0.001" value="0.5">
                            <span id="opt-grid-spacing-value">0.1 AU</span>
                        </div>

                        <div class="opt-field">
                            <label>Grid Extent</label>
                            <input type="range" id="opt-grid-size" min="0" max="1" step="0.001" value="0.5">
                            <span id="opt-grid-size-value">200 AU</span>
                        </div>
                    </details>
                </section>

                <section class="opt-section">
                    <h3>Body Overlays</h3>
                    <details>
                        <summary style="cursor: pointer; color: rgba(255, 255, 255, 0.7); font-size: 11px; margin-bottom: 6px;">Toggle Overlays</summary>
                        <div class="opt-row" style="margin-top: 6px;">
                            <label class="opt-toggle">
                                <input type="checkbox" id="opt-axis-lines">
                                <span>Axis</span>
                            </label>
                            <label class="opt-toggle">
                                <input type="checkbox" id="opt-ref-plane">
                                <span>Ecliptic</span>
                            </label>
                        </div>
                        <div class="opt-row">
                            <label class="opt-toggle">
                                <input type="checkbox" id="opt-ref-line">
                                <span>Ref Line</span>
                            </label>
                            <label class="opt-toggle">
                                <input type="checkbox" id="opt-ref-point">
                                <span>Ref Point</span>
                            </label>
                        </div>
                    </details>
                </section>

                <section class="opt-section">
                    <h3>Trail Length</h3>
                    <div class="opt-slider-row">
                        <input type="range" id="opt-trail-length" min="10" max="2000" step="10">
                        <span id="opt-trail-value">100</span>
                    </div>
                </section>

                <section class="opt-section">
                    <h3>Realistic Textures</h3>
                    <div class="opt-row">
                        <label class="opt-toggle">
                            <input type="checkbox" id="opt-realistic-textures" checked>
                            <span>Use High-Res Textures</span>
                        </label>
                    </div>
                </section>
                <section class="opt-section">
                    <h3>Planetary Rings</h3>
                    <div class="opt-field">
                        <label>Render Quality</label>
                        <select id="opt-ring-quality">
                            <option value="Performance">Performance</option>
                            <option value="HighQualityClose" selected>High Quality (Close-range) (Default)</option>
                            <option value="HighQualityAlways">High Quality (Always)</option>
                        </select>
                    </div>
                </section>
            </div>

            <div class="opt-content" id="tab-camera" style="display: none;">
                <section class="opt-section">
                    <h3>Global Camera Settings</h3>
                    <div class="opt-field">
                        <label>Field of View</label>
                        <div class="opt-slider-row">
                            <input type="range" id="opt-camera-fov" min="10" max="120" step="1" value="53">
                            <span id="opt-camera-fov-value">53°</span>
                        </div>
                    </div>
                </section>

                <section class="opt-section">
                    <details>
                        <summary style="cursor: pointer; font-size: 10px; font-weight: 600; color: rgba(255, 255, 255, 0.5); text-transform: uppercase; letter-spacing: 0.5px; outline: none; margin-bottom: 6px;">Orbital Camera Settings</summary>
                        <div class="opt-field" style="margin-top: 6px;">
                            <label>Rotation Smoothing</label>
                            <div class="opt-slider-row">
                                <input type="range" id="opt-orbital-rotation-damping" min="0.5" max="0.99" step="0.01" value="0.92">
                                <span id="opt-orbital-rotation-damping-value">92%</span>
                            </div>
                        </div>

                        <div class="opt-field">
                            <label>Zoom Smoothing</label>
                            <div class="opt-slider-row">
                                <input type="range" id="opt-orbital-zoom-damping" min="0.5" max="0.99" step="0.01" value="0.9">
                                <span id="opt-orbital-zoom-damping-value">90%</span>
                            </div>
                        </div>
                    </details>
                </section>

                <section class="opt-section">
                    <details>
                        <summary style="cursor: pointer; font-size: 10px; font-weight: 600; color: rgba(255, 255, 255, 0.5); text-transform: uppercase; letter-spacing: 0.5px; outline: none; margin-bottom: 6px;">Free Camera Settings</summary>
                        <div class="opt-field" style="margin-top: 6px;">
                            <label>Rotation Smoothing</label>
                            <div class="opt-slider-row">
                                <input type="range" id="opt-freecam-rotation-damping" min="0" max="0.99" step="0.01" value="0">
                                <span id="opt-freecam-rotation-damping-value">0%</span>
                            </div>
                        </div>

                        <div class="opt-field">
                            <label>Speed (AU/s)</label>
                            <div class="opt-slider-row">
                                <input type="range" id="opt-freecam-speed" min="0" max="100" step="0.1" value="0.1">
                                <span id="opt-freecam-speed-value">0.100 AU/s</span>
                            </div>
                        </div>

                        <div class="opt-field">
                            <label>Sensitivity</label>
                            <div class="opt-slider-row">
                                <input type="range" id="opt-freecam-sensitivity" min="0.1" max="2" step="0.1" value="0.2">
                                <span id="opt-freecam-sensitivity-value">0.2x</span>
                            </div>
                        </div>
                    </details>
                </section>

                <section class="opt-section">
                    <details>
                        <summary style="cursor: pointer; font-size: 10px; font-weight: 600; color: rgba(255, 255, 255, 0.5); text-transform: uppercase; letter-spacing: 0.5px; outline: none; margin-bottom: 6px;">Surface Camera Settings</summary>
                        <div class="opt-field" style="margin-top: 6px;">
                            <label>Rotation Smoothing</label>
                            <div class="opt-slider-row">
                                <input type="range" id="opt-surface-rotation-damping" min="0" max="0.99" step="0.01" value="0">
                                <span id="opt-surface-rotation-damping-value">0%</span>
                            </div>
                        </div>

                        <div class="opt-field">
                            <label>Speed (m/s)</label>
                            <div class="opt-slider-row">
                                <input type="range" id="opt-surface-speed" min="0" max="50" step="0.5" value="5">
                                <span id="opt-surface-speed-value">5.0 m/s</span>
                            </div>
                        </div>

                        <div class="opt-field">
                            <label>Sensitivity</label>
                            <div class="opt-slider-row">
                                <input type="range" id="opt-surface-sensitivity" min="0.1" max="2" step="0.1" value="0.3">
                                <span id="opt-surface-sensitivity-value">0.3x</span>
                            </div>
                        </div>

                        <div class="opt-field">
                            <label>Eye Height (m)</label>
                            <div class="opt-slider-row">
                                <input type="range" id="opt-surface-eye-height" min="0.5" max="5" step="0.1" value="1.7">
                                <span id="opt-surface-eye-height-value">1.7 m</span>
                            </div>
                        </div>
                    </details>
                </section>
            </div>

            <div class="opt-content" id="tab-experimental" style="display: none;">
                <section class="opt-section">
                    <h3>Solar Flares</h3>
                    <div class="opt-row">
                        <label class="opt-toggle">
                            <input type="checkbox" id="opt-flares-visible" checked>
                            <span>Visible</span>
                        </label>
                    </div>
                    <div class="opt-field">
                        <label>Frequency Mode</label>
                        <select id="opt-flare-frequency">
                            <option value="scaled">Scale with Time Warp</option>
                            <option value="fixed" selected>Fixed Rate</option>
                        </select>
                    </div>
                    <div class="opt-field" id="opt-fixed-rate-field">
                        <label>Fixed Rate (per 100s)</label>
                        <div class="opt-slider-row">
                            <input type="range" id="opt-fixed-flare-rate" min="0.2" max="100" step="0.1" value="2">
                            <span id="opt-fixed-flare-rate-value">2.0</span>
                        </div>
                    </div>
                    <div class="opt-field">
                        <label>Brightness</label>
                        <div class="opt-slider-row">
                            <input type="range" id="opt-flare-brightness" min="0" max="3" step="0.05" value="1">
                            <span id="opt-flare-brightness-value">1.00x</span>
                        </div>
                    </div>
                </section>
                <section class="opt-section">
                    <h3>Illumination (Physical)</h3>
                    <div class="opt-field">
                        <label>Global Illumination (Ambient)</label>
                        <div class="opt-slider-row">
                            <input type="range" id="opt-global-illumination" min="0" max="0.5" step="0.01" value="0">
                            <span id="opt-global-illumination-value">0.00</span>
                        </div>
                    </div>
                    <div class="opt-row">
                        <label class="opt-toggle" title="Approximate secondary light from nearby bodies (e.g. Earthshine on the Moon).">
                            <input type="checkbox" id="opt-earthshine" checked>
                            <span>Enable Earthshine</span>
                        </label>
                    </div>
                </section>
            </div>
        `;const t=document.createElement("style");return t.textContent=`
            #opt-panel {
                position: fixed;
                top: 20px;
                right: 300px;
                width: 260px;
                background: ${O.surface.panelBg};
                -webkit-backdrop-filter: blur(16px) saturate(180%);
                backdrop-filter: blur(16px) saturate(180%);
                border: 1px solid ${O.surface.cardBorder};
                box-shadow: ${O.surface.panelShadow};
                border-radius: 12px;
                color: ${O.text.primary};
                font-family: 'Segoe UI', system-ui, sans-serif;
                font-size: 13px;
                z-index: 200;
                display: none;
                flex-direction: column;
                overflow: hidden;
            }

            @media (max-width: 768px) {
                #opt-panel {
                    top: 50% !important;
                    left: 50% !important;
                    right: auto !important;
                    bottom: auto !important;
                    transform: translate(-50%, -50%) !important;
                    width: 90% !important;
                    max-width: 400px;
                    max-height: 80vh;
                    overflow-y: auto;
                }
            }

            #opt-panel.open { display: flex; }

            .opt-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 15px;
                border-bottom: 1px solid ${O.surface.cardBorder};
                background: ${O.surface.headerBg};
                cursor: move;
                user-select: none;
            }

            .opt-header h2 {
                font-size: 14px;
                font-weight: 600;
                margin: 0;
                color: ${O.accent.primary};
            }

            .opt-close {
                background: none;
                border: none;
                color: ${O.text.disabled};
                font-size: 20px;
                cursor: pointer;
                padding: 0 5px;
                line-height: 1;
            }

            .opt-close:hover { color: ${O.text.primary}; }

            .opt-tabs {
                display: flex;
                background: rgba(0, 0, 0, 0.2);
                border-bottom: 1px solid ${O.surface.cardBorder};
            }

            .opt-tab {
                flex: 1;
                background: none;
                border: none;
                color: ${O.text.subtle};
                padding: 10px 0;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                border-bottom: 2px solid transparent;
                transition: color 0.2s, border-color 0.2s;
            }

            .opt-tab:hover {
                color: ${O.text.primary};
                background: ${O.surface.buttonBg};
            }

            .opt-tab.active {
                color: ${O.accent.primary};
                border-bottom-color: ${O.accent.primary};
            }

            .opt-content { 
                padding: 12px 15px; 
                overflow-y: auto;
                max-height: calc(100vh - 80px);
            }
            .opt-content.active { display: block; }

            .opt-section {
                margin-bottom: 14px;
            }

            .opt-section:last-child { margin-bottom: 0; }

            .opt-section h3 {
                font-size: 10px;
                font-weight: 600;
                color: ${O.text.disabled};
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin: 0 0 8px 0;
            }

            .opt-row {
                display: flex;
                justify-content: space-between;
                gap: 10px;
                margin-bottom: 6px;
            }

            .opt-toggle {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 6px 0;
                cursor: pointer;
            }

            .opt-toggle input[type="checkbox"] {
                width: 16px;
                height: 16px;
                accent-color: ${O.accent.primary};
                margin: 0;
            }

            .opt-toggle span {
                font-size: 13px;
                color: ${O.text.secondary};
            }

            .opt-field {
                margin: 8px 0 6px 0;
            }

            .opt-field label {
                display: block;
                font-size: 11px;
                color: ${O.text.subtle};
                margin-bottom: 6px;
            }

            .opt-field select {
                width: 100%;
                background: ${O.surface.inputBg};
                border: 1px solid ${O.surface.cardBorder};
                border-radius: 4px;
                color: ${O.text.primary};
                padding: 6px 8px;
                font-size: 12px;
            }

            .opt-field input[type="range"] {
                width: 100%;
                accent-color: ${O.accent.primary};
                height: 4px;
            }

            .opt-field span {
                font-size: 11px;
                color: ${O.text.subtle};
            }

            .opt-slider-row {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-top: 6px;
            }

            .opt-slider-row input[type="range"] {
                flex: 1;
                accent-color: ${O.accent.primary};
                height: 4px;
            }

            .opt-slider-row span {
                min-width: 60px;
                text-align: right;
                font-size: 12px;
                color: ${O.text.muted};
                font-variant-numeric: tabular-nums;
            }

            .opt-slider-row.disabled {
                opacity: 0.4;
                pointer-events: none;
            }
            .opt-btn {
                width: 100%;
                background: rgba(79, 195, 247, 0.2);
                border: 1px solid ${O.accent.primaryMuted};
                border-radius: 6px;
                color: ${O.text.highContrast};
                padding: 8px;
                font-size: 11px;
                font-weight: 600;
                cursor: pointer;
                margin-bottom: 6px;
                transition: background 0.2s, border-color 0.2s, color 0.2s;
                box-sizing: border-box;
            }
            .opt-btn:hover {
                background: rgba(79, 195, 247, 0.3);
            }
        `,document.head.appendChild(t),e}cacheElements(){this.atmospheresCheckbox=this.container.querySelector("#opt-atmospheres"),this.orbitsCheckbox=this.container.querySelector("#opt-orbits"),this.starLabelsCheckbox=this.container.querySelector("#opt-star-labels"),this.planetLabelsCheckbox=this.container.querySelector("#opt-planet-labels"),this.moonLabelsCheckbox=this.container.querySelector("#opt-moon-labels"),this.gridXYCheckbox=this.container.querySelector("#opt-grid-xy"),this.gridXZCheckbox=this.container.querySelector("#opt-grid-xz"),this.gridYZCheckbox=this.container.querySelector("#opt-grid-yz"),this.gridSpacingInput=this.container.querySelector("#opt-grid-spacing"),this.gridSpacingValue=this.container.querySelector("#opt-grid-spacing-value"),this.gridSizeInput=this.container.querySelector("#opt-grid-size"),this.gridSizeValue=this.container.querySelector("#opt-grid-size-value"),this.trailSlider=this.container.querySelector("#opt-trail-length"),this.trailValue=this.container.querySelector("#opt-trail-value"),this.presetSelect=this.container.querySelector("#opt-preset"),this.presetRenderScaleInput=this.container.querySelector("#opt-render-scale"),this.presetRenderScaleValue=this.container.querySelector("#opt-render-scale-value"),this.presetShadowQualitySelect=this.container.querySelector("#opt-shadow-quality"),this.axisLinesCheckbox=this.container.querySelector("#opt-axis-lines"),this.refPlaneCheckbox=this.container.querySelector("#opt-ref-plane"),this.refLineCheckbox=this.container.querySelector("#opt-ref-line"),this.refPointCheckbox=this.container.querySelector("#opt-ref-point"),this.freeCamSpeedInput=this.container.querySelector("#opt-freecam-speed"),this.freeCamSpeedValue=this.container.querySelector("#opt-freecam-speed-value"),this.freeCamSensitivityInput=this.container.querySelector("#opt-freecam-sensitivity"),this.freeCamSensitivityValue=this.container.querySelector("#opt-freecam-sensitivity-value"),this.freeCamRotationDampingInput=this.container.querySelector("#opt-freecam-rotation-damping"),this.freeCamRotationDampingValue=this.container.querySelector("#opt-freecam-rotation-damping-value"),this.surfaceSpeedInput=this.container.querySelector("#opt-surface-speed"),this.surfaceSpeedValue=this.container.querySelector("#opt-surface-speed-value"),this.surfaceSensitivityInput=this.container.querySelector("#opt-surface-sensitivity"),this.surfaceSensitivityValue=this.container.querySelector("#opt-surface-sensitivity-value"),this.surfaceRotationDampingInput=this.container.querySelector("#opt-surface-rotation-damping"),this.surfaceRotationDampingValue=this.container.querySelector("#opt-surface-rotation-damping-value"),this.surfaceEyeHeightInput=this.container.querySelector("#opt-surface-eye-height"),this.surfaceEyeHeightValue=this.container.querySelector("#opt-surface-eye-height-value"),this.orbitalRotationDampingInput=this.container.querySelector("#opt-orbital-rotation-damping"),this.orbitalRotationDampingValue=this.container.querySelector("#opt-orbital-rotation-damping-value"),this.orbitalZoomDampingInput=this.container.querySelector("#opt-orbital-zoom-damping"),this.orbitalZoomDampingValue=this.container.querySelector("#opt-orbital-zoom-damping-value"),this.fovInput=this.container.querySelector("#opt-camera-fov"),this.fovValue=this.container.querySelector("#opt-camera-fov-value"),this.flareFrequencySelect=this.container.querySelector("#opt-flare-frequency"),this.flareBrightnessInput=this.container.querySelector("#opt-flare-brightness"),this.flareBrightnessValue=this.container.querySelector("#opt-flare-brightness-value"),this.flaresVisibleCheckbox=this.container.querySelector("#opt-flares-visible"),this.fixedFlareRateInput=this.container.querySelector("#opt-fixed-flare-rate"),this.fixedFlareRateValue=this.container.querySelector("#opt-fixed-flare-rate-value"),this.fixedFlareRateField=this.container.querySelector("#opt-fixed-rate-field"),this.ringQualitySelect=this.container.querySelector("#opt-ring-quality"),this.realisticTexturesCheckbox=this.container.querySelector("#opt-realistic-textures"),this.globalIlluminationInput=this.container.querySelector("#opt-global-illumination"),this.globalIlluminationValue=this.container.querySelector("#opt-global-illumination-value"),this.earthshineCheckbox=this.container.querySelector("#opt-earthshine")}bindEvents(){this.container.querySelector(".opt-close")?.addEventListener("click",()=>this.close()),this.setupDrag(),this.setupTabs(),this.atmospheresCheckbox.addEventListener("change",()=>{this.ignoreEvents||(this.options.showAtmospheres=this.atmospheresCheckbox.checked,this.emitChange())}),this.orbitsCheckbox.addEventListener("change",()=>{this.ignoreEvents||(this.options.showOrbitTrails=this.orbitsCheckbox.checked,this.emitChange())}),this.starLabelsCheckbox.addEventListener("change",()=>{this.ignoreEvents||(this.options.showStarLabels=this.starLabelsCheckbox.checked,this.emitChange())}),this.planetLabelsCheckbox.addEventListener("change",()=>{this.ignoreEvents||(this.options.showPlanetLabels=this.planetLabelsCheckbox.checked,this.emitChange())}),this.moonLabelsCheckbox.addEventListener("change",()=>{this.ignoreEvents||(this.options.showMoonLabels=this.moonLabelsCheckbox.checked,this.emitChange())}),this.gridXYCheckbox.addEventListener("change",()=>{this.ignoreEvents||(this.options.showGridXY=this.gridXYCheckbox.checked,this.emitChange())}),this.gridXZCheckbox.addEventListener("change",()=>{this.ignoreEvents||(this.options.showGridXZ=this.gridXZCheckbox.checked,this.emitChange())}),this.gridYZCheckbox.addEventListener("change",()=>{this.ignoreEvents||(this.options.showGridYZ=this.gridYZCheckbox.checked,this.emitChange())}),this.gridSpacingInput.addEventListener("input",()=>{if(this.ignoreEvents)return;const e=parseFloat(this.gridSpacingInput.value),t=this.sliderToSpacing(e);this.options.gridSpacing=t*Ze,t>$t?this.gridSpacingValue.textContent=`${(t/$t).toFixed(3)} ly`:this.gridSpacingValue.textContent=`${t.toFixed(3)} AU`;let i=this.gridExtent/(2*t);i>_n&&(this.gridExtent=_n*2*t,this.gridSizeInput.value=String(this.extentToSlider(this.gridExtent)),this.gridExtent>$t?this.gridSizeValue.textContent=`${(this.gridExtent/$t).toFixed(2)} ly`:this.gridSizeValue.textContent=`${this.gridExtent.toFixed(0)} AU`,i=_n),this.options.gridSize=Math.max(1,Math.round(i)),this.emitChange()}),this.gridSizeInput.addEventListener("input",()=>{if(this.ignoreEvents)return;const e=parseFloat(this.gridSizeInput.value),t=this.sliderToExtent(e);this.gridExtent=t,t>$t?this.gridSizeValue.textContent=`${(t/$t).toFixed(2)} ly`:this.gridSizeValue.textContent=`${t.toFixed(0)} AU`;let i=this.options.gridSpacing/Ze,n=this.gridExtent/(2*i);n>_n&&(i=this.gridExtent/(2*_n),this.options.gridSpacing=i*Ze,this.gridSpacingInput.value=String(this.spacingToSlider(i)),i>$t?this.gridSpacingValue.textContent=`${(i/$t).toFixed(3)} ly`:this.gridSpacingValue.textContent=`${i.toFixed(3)} AU`,n=_n),this.options.gridSize=Math.max(1,Math.round(n)),this.emitChange()}),this.axisLinesCheckbox.addEventListener("change",()=>{this.ignoreEvents||(this.options.showAxisLines=this.axisLinesCheckbox.checked,this.emitChange())}),this.refPlaneCheckbox.addEventListener("change",()=>{this.ignoreEvents||(this.options.showRefPlane=this.refPlaneCheckbox.checked,this.emitChange())}),this.refLineCheckbox.addEventListener("change",()=>{this.ignoreEvents||(this.options.showRefLine=this.refLineCheckbox.checked,this.emitChange())}),this.refPointCheckbox.addEventListener("change",()=>{this.ignoreEvents||(this.options.showRefPoint=this.refPointCheckbox.checked,this.emitChange())}),this.trailSlider.addEventListener("input",()=>{this.ignoreEvents||(this.options.orbitTrailLength=parseInt(this.trailSlider.value),this.trailValue.textContent=this.trailSlider.value,this.emitChange())}),this.presetSelect.addEventListener("change",()=>{if(this.ignoreEvents)return;const e=this.presetSelect.value;this.presetName=e,this.onPresetChange?.(e)}),this.presetRenderScaleInput.addEventListener("change",()=>{const e=parseFloat(this.presetRenderScaleInput.value);this.presetRenderScale=e,this.onPresetEdit?.(this.presetName,{renderScale:e})}),this.presetShadowQualitySelect.addEventListener("change",()=>{const e=this.presetShadowQualitySelect.value;this.presetShadowQuality=e,this.onPresetEdit?.(this.presetName,{shadowQuality:e})}),this.freeCamSpeedInput.addEventListener("input",()=>{const e=parseFloat(this.freeCamSpeedInput.value);this.freeCamSpeed=e,this.freeCamSpeedValue.textContent=`${e.toFixed(3)} AU/s`,this.onFreeCamSpeedChange?.(e)}),this.freeCamSensitivityInput.addEventListener("input",()=>{const e=parseFloat(this.freeCamSensitivityInput.value);this.freeCamSensitivity=e,this.freeCamSensitivityValue.textContent=`${e.toFixed(1)}x`,this.onFreeCamSensitivityChange?.(e)}),this.freeCamRotationDampingInput.addEventListener("input",()=>{const e=parseFloat(this.freeCamRotationDampingInput.value);this.freeCamRotationDamping=e,this.freeCamRotationDampingValue.textContent=`${Math.round(e*100)}%`,this.onFreeCamRotationDampingChange?.(e)}),this.surfaceSpeedInput.addEventListener("input",()=>{const e=parseFloat(this.surfaceSpeedInput.value);this.surfaceSpeed=e,this.surfaceSpeedValue.textContent=`${e.toFixed(1)} m/s`,this.onSurfaceSpeedChange?.(e)}),this.surfaceSensitivityInput.addEventListener("input",()=>{const e=parseFloat(this.surfaceSensitivityInput.value);this.surfaceSensitivity=e,this.surfaceSensitivityValue.textContent=`${e.toFixed(1)}x`,this.onSurfaceSensitivityChange?.(e)}),this.surfaceRotationDampingInput.addEventListener("input",()=>{const e=parseFloat(this.surfaceRotationDampingInput.value);this.surfaceRotationDamping=e,this.surfaceRotationDampingValue.textContent=`${Math.round(e*100)}%`,this.onSurfaceRotationDampingChange?.(e)}),this.surfaceEyeHeightInput.addEventListener("input",()=>{const e=parseFloat(this.surfaceEyeHeightInput.value);this.surfaceEyeHeight=e,this.surfaceEyeHeightValue.textContent=`${e.toFixed(1)} m`,this.onSurfaceEyeHeightChange?.(e)}),this.orbitalRotationDampingInput.addEventListener("input",()=>{const e=parseFloat(this.orbitalRotationDampingInput.value);this.orbitalRotationDamping=e,this.orbitalRotationDampingValue.textContent=`${Math.round(e*100)}%`,this.onOrbitalRotationDampingChange?.(e)}),this.orbitalZoomDampingInput.addEventListener("input",()=>{const e=parseFloat(this.orbitalZoomDampingInput.value);this.orbitalZoomDamping=e,this.orbitalZoomDampingValue.textContent=`${Math.round(e*100)}%`,this.onOrbitalZoomDampingChange?.(e)}),this.fovInput.addEventListener("input",()=>{const e=parseFloat(this.fovInput.value);this.cameraFov=e,this.fovValue.textContent=`${e}°`,this.onFovChange?.(e)}),this.flaresVisibleCheckbox.addEventListener("change",()=>{this.ignoreEvents||(this.experimentalOptions.flaresVisible=this.flaresVisibleCheckbox.checked,this.emitExperimentalChange())}),this.realisticTexturesCheckbox.addEventListener("change",()=>{this.ignoreEvents||(this.experimentalOptions.useRealisticTextures=this.realisticTexturesCheckbox.checked,this.emitExperimentalChange())}),this.flareFrequencySelect.addEventListener("change",()=>{this.ignoreEvents||(this.experimentalOptions.flareFrequencyMode=this.flareFrequencySelect.value,this.fixedFlareRateField.style.display=this.experimentalOptions.flareFrequencyMode==="fixed"?"":"none",this.emitExperimentalChange())}),this.flareBrightnessInput.addEventListener("input",()=>{if(this.ignoreEvents)return;const e=parseFloat(this.flareBrightnessInput.value);this.experimentalOptions.flareBrightness=e,this.flareBrightnessValue.textContent=`${e.toFixed(2)}x`,this.emitExperimentalChange()}),this.fixedFlareRateInput.addEventListener("input",()=>{if(this.ignoreEvents)return;const e=parseFloat(this.fixedFlareRateInput.value);this.experimentalOptions.fixedFlareRate=e,this.fixedFlareRateValue.textContent=`${e.toFixed(1)}`,this.emitExperimentalChange()}),this.ringQualitySelect.addEventListener("change",()=>{this.ignoreEvents||(this.experimentalOptions.ringQuality=this.ringQualitySelect.value,this.emitExperimentalChange())}),this.globalIlluminationInput.addEventListener("input",()=>{this.ignoreEvents||(this.experimentalOptions.globalIllumination=parseFloat(this.globalIlluminationInput.value),this.globalIlluminationValue.textContent=this.experimentalOptions.globalIllumination.toFixed(2),this.emitExperimentalChange())}),this.earthshineCheckbox.addEventListener("change",()=>{this.ignoreEvents||(this.experimentalOptions.earthshineEnabled=this.earthshineCheckbox.checked,this.emitExperimentalChange())})}setupTabs(){const e=this.container.querySelectorAll(".opt-tab"),t=this.container.querySelectorAll(".opt-content");e.forEach(i=>{i.addEventListener("click",()=>{const n=i.dataset.tab;e.forEach(r=>r.classList.toggle("active",r===i)),t.forEach(r=>{const a=r.id.replace("tab-","");r.style.display=a===n?"block":"none"})})})}setupKeyboardShortcut(){window.addEventListener("keydown",e=>{e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement||((e.key==="o"||e.key==="O")&&this.toggle(),e.key==="Escape"&&this.isOpen&&this.close())})}setupDrag(){let e=0,t=0,i=0,n=0,r=!1;const a=l=>{if(!r)return;const c=l.clientX-e,h=l.clientY-t;this.container.style.left=`${i+c}px`,this.container.style.top=`${n+h}px`},o=()=>{r=!1,document.removeEventListener("mousemove",a),document.removeEventListener("mouseup",o)};this.container.addEventListener("mousedown",l=>{if(l.target.closest("input, select, button, textarea, label, summary, a, option, [contenteditable], .opt-tab-btn, .tab-btn")||l.button!==0)return;const h=this.container.getBoundingClientRect();e=l.clientX,t=l.clientY,i=h.left,n=h.top,this.container.style.left=`${h.left}px`,this.container.style.top=`${h.top}px`,this.container.style.right="auto",r=!0,document.addEventListener("mousemove",a),document.addEventListener("mouseup",o)})}emitChange(){this.onChange({...this.options})}emitExperimentalChange(){this.onExperimentalChange?.({...this.experimentalOptions})}syncUIFromOptions(){this.ignoreEvents=!0,this.atmospheresCheckbox.checked=this.options.showAtmospheres,this.orbitsCheckbox.checked=this.options.showOrbitTrails,this.starLabelsCheckbox.checked=this.options.showStarLabels,this.planetLabelsCheckbox.checked=this.options.showPlanetLabels,this.moonLabelsCheckbox.checked=this.options.showMoonLabels,this.gridXYCheckbox.checked=this.options.showGridXY,this.gridXZCheckbox.checked=this.options.showGridXZ,this.gridYZCheckbox.checked=this.options.showGridYZ,this.axisLinesCheckbox.checked=this.options.showAxisLines,this.refPlaneCheckbox.checked=this.options.showRefPlane,this.refLineCheckbox.checked=this.options.showRefLine,this.refPointCheckbox.checked=this.options.showRefPoint,this.gridSpacingInput.value=String(this.spacingToSlider(this.options.gridSpacing/Ze));const e=this.options.gridSpacing/Ze;e>$t?this.gridSpacingValue.textContent=`${(e/$t).toFixed(3)} ly`:this.gridSpacingValue.textContent=`${e.toFixed(3)} AU`;const t=this.options.gridSize*2*e;this.gridExtent=t,this.gridSizeInput.value=String(this.extentToSlider(t)),t>$t?this.gridSizeValue.textContent=`${(t/$t).toFixed(2)} ly`:this.gridSizeValue.textContent=`${t.toFixed(0)} AU`,this.trailSlider.value=String(this.options.orbitTrailLength),this.trailValue.textContent=String(this.options.orbitTrailLength),this.presetSelect.value=this.presetName,this.presetRenderScaleInput.value=this.presetRenderScale.toString(),this.presetRenderScaleValue.textContent=this.presetRenderScale.toFixed(2)+"x",this.presetShadowQualitySelect.value=this.presetShadowQuality,this.freeCamSpeedInput.value=this.freeCamSpeed.toString(),this.freeCamSpeedValue.textContent=`${this.freeCamSpeed.toFixed(3)} AU/s`,this.freeCamSensitivityInput.value=this.freeCamSensitivity.toString(),this.freeCamSensitivityValue.textContent=`${this.freeCamSensitivity.toFixed(1)}x`,this.freeCamRotationDampingInput.value=this.freeCamRotationDamping.toString(),this.freeCamRotationDampingValue.textContent=`${Math.round(this.freeCamRotationDamping*100)}%`,this.surfaceSpeedInput.value=this.surfaceSpeed.toString(),this.surfaceSpeedValue.textContent=`${this.surfaceSpeed.toFixed(1)} m/s`,this.surfaceSensitivityInput.value=this.surfaceSensitivity.toString(),this.surfaceSensitivityValue.textContent=`${this.surfaceSensitivity.toFixed(1)}x`,this.surfaceRotationDampingInput.value=this.surfaceRotationDamping.toString(),this.surfaceRotationDampingValue.textContent=`${Math.round(this.surfaceRotationDamping*100)}%`,this.surfaceEyeHeightInput.value=this.surfaceEyeHeight.toString(),this.surfaceEyeHeightValue.textContent=`${this.surfaceEyeHeight.toFixed(1)} m`,this.orbitalRotationDampingInput.value=this.orbitalRotationDamping.toString(),this.orbitalRotationDampingValue.textContent=`${Math.round(this.orbitalRotationDamping*100)}%`,this.orbitalZoomDampingInput.value=this.orbitalZoomDamping.toString(),this.orbitalZoomDampingValue.textContent=`${Math.round(this.orbitalZoomDamping*100)}%`,this.fovInput.value=this.cameraFov.toString(),this.fovValue.textContent=`${this.cameraFov}°`,this.flaresVisibleCheckbox.checked=this.experimentalOptions.flaresVisible,this.realisticTexturesCheckbox.checked=this.experimentalOptions.useRealisticTextures,this.flareFrequencySelect.value=this.experimentalOptions.flareFrequencyMode,this.flareBrightnessInput.value=this.experimentalOptions.flareBrightness.toString(),this.flareBrightnessValue.textContent=`${this.experimentalOptions.flareBrightness.toFixed(2)}x`,this.fixedFlareRateInput.value=this.experimentalOptions.fixedFlareRate.toString(),this.fixedFlareRateValue.textContent=`${this.experimentalOptions.fixedFlareRate.toFixed(1)}`,this.fixedFlareRateField.style.display=this.experimentalOptions.flareFrequencyMode==="fixed"?"":"none",this.ringQualitySelect.value=this.experimentalOptions.ringQuality,this.experimentalOptions.globalIllumination!==void 0&&(this.globalIlluminationInput.value=this.experimentalOptions.globalIllumination.toString(),this.globalIlluminationValue.textContent=this.experimentalOptions.globalIllumination.toFixed(2)),this.experimentalOptions.earthshineEnabled!==void 0&&(this.earthshineCheckbox.checked=this.experimentalOptions.earthshineEnabled),this.ignoreEvents=!1}toggle(){this.isOpen?this.close():this.open()}open(){this.isOpen=!0,this.container.classList.add("open")}close(){this.isOpen=!1,this.container.classList.remove("open")}getOptions(){return{...this.options}}applyOptions(e){this.options={...e},this.syncUIFromOptions()}setPreset(e){this.ignoreEvents=!0,this.presetName=e,this.presetSelect.value=e,this.ignoreEvents=!1}setPresetRenderScale(e){this.presetRenderScale=e,this.ignoreEvents||this.syncUIFromOptions()}setPresetShadowQuality(e){this.presetShadowQuality=e,this.ignoreEvents||this.syncUIFromOptions()}setFreeCamSpeed(e){this.freeCamSpeed=e,this.freeCamSpeedInput.value=e.toString(),this.freeCamSpeedValue.textContent=`${e.toFixed(3)} AU/s`}setFreeCamSensitivity(e){this.freeCamSensitivity=e,this.freeCamSensitivityInput.value=e.toString(),this.freeCamSensitivityValue.textContent=`${e.toFixed(1)}x`}setFreeCamRotationDamping(e){this.freeCamRotationDamping=e,this.freeCamRotationDampingInput.value=e.toString(),this.freeCamRotationDampingValue.textContent=`${Math.round(e*100)}%`}setSurfaceSpeed(e){this.surfaceSpeed=e,this.surfaceSpeedInput.value=e.toString(),this.surfaceSpeedValue.textContent=`${e.toFixed(1)} m/s`}setSurfaceSensitivity(e){this.surfaceSensitivity=e,this.surfaceSensitivityInput.value=e.toString(),this.surfaceSensitivityValue.textContent=`${e.toFixed(1)}x`}setSurfaceRotationDamping(e){this.surfaceRotationDamping=e,this.surfaceRotationDampingInput.value=e.toString(),this.surfaceRotationDampingValue.textContent=`${Math.round(e*100)}%`}setSurfaceEyeHeight(e){this.surfaceEyeHeight=e,this.surfaceEyeHeightInput.value=e.toString(),this.surfaceEyeHeightValue.textContent=`${e.toFixed(1)} m`}setOrbitalRotationDamping(e){this.orbitalRotationDamping=e,this.orbitalRotationDampingInput.value=e.toString(),this.orbitalRotationDampingValue.textContent=`${Math.round(e*100)}%`}setOrbitalZoomDamping(e){this.orbitalZoomDamping=e,this.orbitalZoomDampingInput.value=e.toString(),this.orbitalZoomDampingValue.textContent=`${Math.round(e*100)}%`}}class a0{physicsTimestep=3600;speedIndex=0;accumulator=0;paused=!1;onSpeedChange;onPauseChange;update(e){if(this.paused)return 0;const t=fi[this.speedIndex].sim;this.accumulator+=e*t;let i=0;for(;this.accumulator>=this.physicsTimestep;)this.accumulator-=this.physicsTimestep,i++;const n=100;return i>n?(this.accumulator=Math.min(this.accumulator,n*this.physicsTimestep),n):i}updateHybrid(e,t,i,n){if(this.paused)return 0;const r=fi[this.speedIndex].sim;this.accumulator+=e*r;let a=0,o=this.physicsTimestep,l=Math.floor(this.accumulator/o);return l>t?(o=this.accumulator/t,l=t,this.accumulator=0):this.accumulator-=l*this.physicsTimestep,l>0&&(n(o,l),a=l),a}getPhysicsTimestep(){return this.physicsTimestep}setPhysicsTimestep(e){e>0&&(this.physicsTimestep=e)}getCurrentSpeed(){return fi[this.speedIndex]}getSpeedLevels(){return[...fi]}getSpeedIndex(){return this.speedIndex}setSpeedIndex(e){e>=0&&e<fi.length&&(this.speedIndex=e,this.onSpeedChange?.(this.getCurrentSpeed()))}setSpeedBySimRate(e){if(!Number.isFinite(e)||e<=0)return;let t=0,i=Math.abs(fi[0].sim-e);for(let n=1;n<fi.length;n++){const r=Math.abs(fi[n].sim-e);r<i&&(i=r,t=n)}this.speedIndex=t,this.onSpeedChange?.(this.getCurrentSpeed())}togglePause(){this.paused=!this.paused,this.onPauseChange?.(this.paused)}setPaused(e){this.paused=e,this.onPauseChange?.(this.paused)}isPaused(){return this.paused}getDisplayLabel(){return this.paused?"|| PAUSED":`${fi[this.speedIndex].label}`}setOnSpeedChange(e){this.onSpeedChange=e}setOnPauseChange(e){this.onPauseChange=e}resetAccumulator(){this.accumulator=0}}const o0=()=>window.location.protocol==="https:"?"wss":"ws",l0=()=>`${o0()}://${window.location.host}`;class ze{static presets=null;static defaultPreset="Low";static featureDescriptors=new Map;static featureHooks=new Map;static playerPresets=new Map;static subscribers=new Map;static loadPresets(e){this.presets=e.presets}static reset(){this.presets=null,this.defaultPreset="Low",this.featureDescriptors.clear(),this.featureHooks.clear(),this.playerPresets.clear(),this.subscribers.clear()}static setDefaultPreset(e){this.defaultPreset=e}static registerFeature(e,t){this.featureDescriptors.set(e,t)}static registerFeatureHooks(e,t){this.featureHooks.set(e,t)}static getPresetForPlayer(e){const t=this.playerPresets.get(e)??this.defaultPreset;return this.getPresetByName(t)}static getPresetNameForPlayer(e){return this.playerPresets.get(e)??this.defaultPreset}static updatePreset(e,t){if(!this.presets)throw new Error("Visual presets not loaded");const i=this.presets[e];if(!i)throw new Error(`Unknown visual preset: ${e}`);const n={...i,...t};if(!Number.isFinite(n.renderScale)||n.renderScale<=0)throw new Error("renderScale must be > 0");if(!Number.isFinite(n.maxTextureSize)||n.maxTextureSize<=0)throw new Error("maxTextureSize must be > 0");if(!Number.isFinite(n.atmosphereLUTResolution)||n.atmosphereLUTResolution<=0)throw new Error("atmosphereLUTResolution must be > 0");if(!Number.isFinite(n.maxShaderSamples)||n.maxShaderSamples<=0)throw new Error("maxShaderSamples must be > 0");if(!Number.isFinite(n.performanceBudgetMs)||n.performanceBudgetMs<=0)throw new Error("performanceBudgetMs must be > 0");this.presets[e]=n;for(const[r,a]of this.subscribers.entries()){if(a.size===0)continue;const o=this.getPresetNameForPlayer(r);for(const l of a)l(o)}}static setPlayerPreset(e,t){this.playerPresets.set(e,t);const i=this.subscribers.get(e);if(i)for(const n of i)n(t)}static hasPlayerPreset(e){return this.playerPresets.has(e)}static resolveFeatureParams(e,t){const i=this.playerPresets.get(e)??this.defaultPreset,n=this.getPresetByName(i),r=this.featureDescriptors.get(t)??{},a=this.featureHooks.get(t),o=a?.defaultParams??{},l=r[i]??{},c={...o,...l};return a?.validatePresetMapping&&a.validatePresetMapping(c),a?.applyPreset?a.applyPreset(c,n):c}static subscribe(e,t){const i=this.subscribers.get(e)??new Set;return i.add(t),this.subscribers.set(e,i),()=>{const n=this.subscribers.get(e);n&&(n.delete(t),n.size===0&&this.subscribers.delete(e))}}static getPresetByName(e){if(!this.presets)throw new Error("Visual presets not loaded");const t=this.presets[e];if(!t)throw new Error(`Unknown visual preset: ${e}`);return t}}const c0="1.0",h0={Low:{renderScale:1,maxTextureSize:512,atmosphereLUTResolution:32,cloudQuality:"Off",shadowQuality:"Off",reflectionMode:"Off",granulationEnabled:!1,flareQuality:"Low",lodBias:.5,maxShaderSamples:16,performanceBudgetMs:8},High:{renderScale:1,maxTextureSize:2048,atmosphereLUTResolution:64,cloudQuality:"High",shadowQuality:"Binary",reflectionMode:"SSR",granulationEnabled:!0,flareQuality:"High",lodBias:0,maxShaderSamples:48,performanceBudgetMs:12},Ultra:{renderScale:1,maxTextureSize:4096,atmosphereLUTResolution:128,cloudQuality:"Volumetric",shadowQuality:"Penumbra",reflectionMode:"SSR+Fallback",granulationEnabled:!0,flareQuality:"Ultra",lodBias:-.5,maxShaderSamples:96,performanceBudgetMs:16}},u0={version:c0,presets:h0};function d0(){ze.registerFeature("starRenderer",{Low:{maxTextureSize:256,granulationEnabled:!1,flareQuality:"Low"},High:{maxTextureSize:1024,granulationEnabled:!0,flareQuality:"High"},Ultra:{maxTextureSize:4096,granulationEnabled:!0,flareQuality:"Ultra"}}),ze.registerFeatureHooks("starRenderer",{defaultParams:{maxTextureSize:1024,granulationEnabled:!0,flareQuality:"High"},applyPreset:(s,e)=>({...s,maxTextureSize:Math.min(typeof s.maxTextureSize=="number"?s.maxTextureSize:e.maxTextureSize,e.maxTextureSize),granulationEnabled:!!s.granulationEnabled,flareQuality:s.flareQuality??e.flareQuality}),validatePresetMapping:s=>{if("renderScale"in s)throw new Error("starRenderer presets must not alter renderScale")}}),ze.registerFeature("planetRenderer",{Low:{maxTextureSize:512,lodBias:.5},High:{maxTextureSize:2048,lodBias:0},Ultra:{maxTextureSize:4096,lodBias:-.5}}),ze.registerFeatureHooks("planetRenderer",{defaultParams:{maxTextureSize:2048,lodBias:0},applyPreset:(s,e)=>({...s,maxTextureSize:Math.min(typeof s.maxTextureSize=="number"?s.maxTextureSize:e.maxTextureSize,e.maxTextureSize),lodBias:typeof s.lodBias=="number"?s.lodBias:e.lodBias}),validatePresetMapping:s=>{if("renderScale"in s)throw new Error("planetRenderer presets must not alter renderScale")}}),ze.registerFeature("atmosphereRenderer",{Low:{atmosphereLUTResolution:32},High:{atmosphereLUTResolution:64},Ultra:{atmosphereLUTResolution:128}}),ze.registerFeatureHooks("atmosphereRenderer",{defaultParams:{atmosphereLUTResolution:64},applyPreset:(s,e)=>({...s,atmosphereLUTResolution:typeof s.atmosphereLUTResolution=="number"?s.atmosphereLUTResolution:e.atmosphereLUTResolution}),validatePresetMapping:s=>{if(typeof s.atmosphereLUTResolution=="number"&&s.atmosphereLUTResolution<=0)throw new Error("atmosphereRenderer LUT resolution must be > 0")}}),ze.registerFeature("cloudRenderer",{Low:{cloudQuality:"Off"},High:{cloudQuality:"High"},Ultra:{cloudQuality:"Volumetric"}}),ze.registerFeatureHooks("cloudRenderer",{defaultParams:{cloudQuality:"High"},applyPreset:(s,e)=>({...s,cloudQuality:s.cloudQuality??e.cloudQuality})}),ze.registerFeature("shadowRenderer",{Low:{shadowQuality:"Off"},High:{shadowQuality:"Binary"},Ultra:{shadowQuality:"Penumbra"}}),ze.registerFeatureHooks("shadowRenderer",{defaultParams:{shadowQuality:"Binary"},applyPreset:(s,e)=>({...s,shadowQuality:e.shadowQuality??s.shadowQuality})}),ze.registerFeature("reflectionRenderer",{Low:{reflectionMode:"Off"},High:{reflectionMode:"SSR"},Ultra:{reflectionMode:"SSR+Fallback"}}),ze.registerFeatureHooks("reflectionRenderer",{defaultParams:{reflectionMode:"SSR"},applyPreset:(s,e)=>({...s,reflectionMode:s.reflectionMode??e.reflectionMode})}),ze.registerFeature("postProcessRenderer",{Low:{maxShaderSamples:16},High:{maxShaderSamples:48},Ultra:{maxShaderSamples:96}}),ze.registerFeatureHooks("postProcessRenderer",{defaultParams:{maxShaderSamples:48},applyPreset:(s,e)=>({...s,maxShaderSamples:Math.min(typeof s.maxShaderSamples=="number"?s.maxShaderSamples:e.maxShaderSamples,e.maxShaderSamples)}),validatePresetMapping:s=>{if(typeof s.maxShaderSamples=="number"&&s.maxShaderSamples<=0)throw new Error("postProcessRenderer maxShaderSamples must be > 0")}}),ze.registerFeature("terrainRenderer",{Low:{lodBias:.5},High:{lodBias:0},Ultra:{lodBias:-.5}}),ze.registerFeatureHooks("terrainRenderer",{defaultParams:{lodBias:0},applyPreset:(s,e)=>({...s,lodBias:typeof s.lodBias=="number"?s.lodBias:e.lodBias})}),ze.registerFeature("ringRenderer",{Low:{maxTextureSize:512},High:{maxTextureSize:2048},Ultra:{maxTextureSize:4096}}),ze.registerFeatureHooks("ringRenderer",{defaultParams:{maxTextureSize:2048},applyPreset:(s,e)=>({...s,maxTextureSize:Math.min(typeof s.maxTextureSize=="number"?s.maxTextureSize:e.maxTextureSize,e.maxTextureSize)})})}function f0(s){let e=s|0;return()=>{e=e+2654435769|0;let t=e;return t=Math.imul(t^t>>>16,2246822507),t=Math.imul(t^t>>>13,3266489909),t=(t^t>>>16)>>>0,t/4294967296}}const p0=`
attribute float a_brightness;
varying vec3 vColor;
varying float vBrightness;
uniform float u_pixelRatio;
uniform float u_baseSize;

void main() {
    vColor = color;
    vBrightness = a_brightness;

    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPos;

    // Fixed pixel size — does not attenuate with distance.
    // Bright stars get larger points; dim stars get smaller.
    // a_brightness is in [0, 1] where 1 = brightest.
    float size = u_baseSize * u_pixelRatio * (0.6 + 2.4 * a_brightness);
    gl_PointSize = max(size, 0.8 * u_pixelRatio);
}
`,m0=`
varying vec3 vColor;
varying float vBrightness;

void main() {
    // Circular point with soft anti-aliased edge
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center) * 2.0;

    // Smooth circular falloff — core is bright, edge fades
    float alpha = 1.0 - smoothstep(0.0, 1.0, dist);

    // Brightness modulates both alpha and color intensity
    // Dim stars appear more neutral; bright stars show vivid color
    float intensity = 0.3 + 0.7 * vBrightness;
    vec3 col = vColor * intensity;

    // Overall alpha based on brightness and circular shape
    float finalAlpha = alpha * (0.25 + 0.75 * vBrightness);

    gl_FragColor = vec4(col, finalAlpha);
}
`,g0={starCount:3600,starSize:1.8,seed:42,skyRadius:5e14};class v0{scene;starfield=null;options;constructor(e,t){this.scene=e,this.options={...g0,...t}}setOptions(e){this.options={...this.options,...e},this.generate()}get seed(){return this.options.seed}set seed(e){this.options.seed=e,this.generate()}generate(){this.dispose();const{starCount:e,starSize:t,seed:i,skyRadius:n}=this.options,r=Math.max(100,Math.round(e)),a=f0(i),o=new Float32Array(r*3),l=new Float32Array(r*3),c=new Float32Array(r);for(let f=0;f<r;f++){const p=a()*Math.PI*2,g=Math.acos(2*a()-1);o[f*3]=n*Math.sin(g)*Math.cos(p),o[f*3+1]=n*Math.sin(g)*Math.sin(p),o[f*3+2]=n*Math.cos(g);const y=Tg(a()),[m,u,v]=rs(y),_=a(),x=_*_*_,T=.3+.7*x,C=(m+u+v)/3;l[f*3]=C+(m-C)*T,l[f*3+1]=C+(u-C)*T,l[f*3+2]=C+(v-C)*T,c[f]=x}const h=new vt;h.setAttribute("position",new lt(o,3)),h.setAttribute("color",new lt(l,3)),h.setAttribute("a_brightness",new lt(c,1));const d=new dt({vertexShader:p0,fragmentShader:m0,uniforms:{u_pixelRatio:{value:Math.min(window.devicePixelRatio,2)},u_baseSize:{value:t}},vertexColors:!0,transparent:!0,depthTest:!0,depthWrite:!1,blending:$i});this.starfield=new du(h,d),this.starfield.name="starfield",this.starfield.frustumCulled=!1,this.scene.add(this.starfield)}dispose(){this.starfield&&(this.scene.remove(this.starfield),this.starfield.geometry.dispose(),this.starfield.material.dispose(),this.starfield=null)}get isActive(){return this.starfield!==null}}class y0{container;enabled=!1;callbacks;touchStartDistance=0;lastTouchX=0;lastTouchY=0;isTouching=!1;boundTouchStart=this.handleTouchStart.bind(this);boundTouchMove=this.handleTouchMove.bind(this);boundTouchEnd=this.handleTouchEnd.bind(this);constructor(e){this.callbacks=e}enable(){this.enabled||(this.enabled=!0,this.createUI(),this.setupCameraGestures())}disable(){this.enabled&&(this.enabled=!1,this.removeUI(),this.removeCameraGestures())}isEnabled(){return this.enabled}toggle(){this.enabled?this.disable():this.enable()}createUI(){const e=document.createElement("div");e.id="touch-controls";const t='<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22l-1.92 3.32c-.12.21-.07.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .43-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>',i='<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>',n='<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>',r='<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M6 6h2v12H6V6zm3.5 6l8.5 6V6l-8.5 6z"/></svg>',a='<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zm0 13c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>',o='<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"/></svg>',l='<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M19.5 11c-.26-3.85-3.32-6.91-7.18-7.18V1h-1.64v2.82C6.82 4.09 3.76 7.15 3.5 11H1v1.64h2.5c.26 3.85 3.32 6.91 7.18 7.18V22h1.64v-2.18c3.86-.27 6.92-3.33 7.18-7.18H22v-1.64h-2.5zm-7.5 7C8.14 18 5 14.86 5 11s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zm0-10c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>',c='<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M15 8v8H5V8h10m1-2H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4V7c0-.55-.45-1-1-1z"/></svg>',d='<button class="touch-btn" data-action="chat" title="Open Chat (T)"><svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg></button>';e.innerHTML=`
            <div class="touch-controls-panel top-right">
                <button class="touch-btn" data-action="admin" title="Admin Panel (\`)">${i}</button>
                <button class="touch-btn" data-action="options" title="Options (O)">${t}</button>
            </div>
            <div class="touch-controls-panel bottom-right">
                <button class="touch-btn" data-action="follow-next" title="Follow Next (N)">${n}</button>
                <button class="touch-btn" data-action="follow-prev" title="Follow Previous (P)">${r}</button>
            </div>
            <div class="touch-controls-panel bottom-left">
                <button class="touch-btn" data-action="toggle-follow" title="Toggle Follow Section (2)">${l}</button>
                <button class="touch-btn" data-action="toggle-sim" title="Toggle Sim Params (1)">${o}</button>
                <button class="touch-btn" data-action="toggle-ui" title="Toggle UI (H)">${a}</button>
            </div>
            <div class="touch-controls-panel left-center">
                <!-- Free camera button removed from mobile UI (not yet optimized for touch) -->
                <!-- <button class="touch-btn" data-action="free-camera" title="Free Camera (C)">${c}</button> -->
                ${d}
            </div>
        `;const f=document.createElement("style");f.textContent=`
            #touch-controls {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 200;
            }

            #touch-controls.ui-hidden .touch-btn:not([data-action="toggle-ui"]) {
                display: none;
            }

            .touch-controls-panel {
                position: absolute;
                display: flex;
                gap: 8px;
                pointer-events: auto;
            }

            .touch-controls-panel.top-right {
                top: 12px;
                right: 12px;
                flex-direction: column;
            }

            .touch-controls-panel.bottom-right {
                bottom: 12px;
                right: 12px;
                flex-direction: column;
            }

            .touch-controls-panel.bottom-left {
                bottom: 12px;
                left: 12px;
                flex-direction: column;
            }

            .touch-controls-panel.left-center {
                left: 12px;
                top: 50%;
                transform: translateY(-50%);
                flex-direction: column;
            }

            .touch-btn {
                width: 48px;
                height: 48px;
                border: none;
                border-radius: 50%;
                background: linear-gradient(160deg, ${O.touch.btnGradientStart}, ${O.touch.btnGradientEnd});
                backdrop-filter: blur(8px);
                color: ${O.text.primary};
                font-size: 20px;
                cursor: pointer;
                box-shadow: 0 4px 12px ${O.touch.btnShadow}, inset 0 1px 0 rgba(255, 255, 255, 0.15);
                border: 1px solid ${O.touch.btnBorder};
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                -webkit-tap-highlight-color: transparent;
                user-select: none;
                -webkit-user-select: none;
            }

            .touch-btn:active {
                transform: scale(0.95);
                background: linear-gradient(160deg, ${O.touch.btnGradientActiveStart}, ${O.touch.btnGradientActiveEnd});
                box-shadow: 0 2px 8px ${O.surface.panelShadow}, inset 0 1px 0 rgba(255, 255, 255, 0.2);
            }

            .touch-btn:hover {
                background: linear-gradient(160deg, ${O.touch.btnGradientHoverStart}, ${O.touch.btnGradientHoverEnd});
            }

            @media (max-width: 768px) {
                .touch-btn {
                    width: 44px;
                    height: 44px;
                    font-size: 18px;
                }
                
                .touch-controls-panel {
                    gap: 6px;
                }
            }
        `,document.head.appendChild(f),document.body.appendChild(e),this.container=e,this.setupButtonListeners()}removeUI(){this.container&&(this.container.remove(),this.container=void 0)}setupButtonListeners(){if(!this.container)return;this.container.querySelectorAll(".touch-btn").forEach(t=>{const i=t.getAttribute("data-action");i&&(t.addEventListener("click",n=>{n.preventDefault(),n.stopPropagation(),this.handleAction(i)}),t.addEventListener("contextmenu",n=>{n.preventDefault()}))})}handleAction(e){switch(e){case"options":this.callbacks.onOpenOptions();break;case"follow-next":this.callbacks.onFollowNext();break;case"follow-prev":this.callbacks.onFollowPrevious();break;case"toggle-ui":this.callbacks.onToggleUI();break;case"toggle-sim":this.callbacks.onToggleSim();break;case"toggle-follow":this.callbacks.onToggleFollow();break;case"free-camera":this.callbacks.onToggleFreeCamera();break;case"chat":this.callbacks.onOpenChat();break;case"admin":this.callbacks.onOpenAdmin();break}}setupCameraGestures(){const e=document.getElementById("canvas-container");e&&(e.addEventListener("touchstart",this.boundTouchStart,{passive:!1}),e.addEventListener("touchmove",this.boundTouchMove,{passive:!1}),e.addEventListener("touchend",this.boundTouchEnd,{passive:!1}))}removeCameraGestures(){const e=document.getElementById("canvas-container");e&&(e.removeEventListener("touchstart",this.boundTouchStart),e.removeEventListener("touchmove",this.boundTouchMove),e.removeEventListener("touchend",this.boundTouchEnd))}handleTouchStart(e){if(e.touches.length===1)this.isTouching=!0,this.lastTouchX=e.touches[0].clientX,this.lastTouchY=e.touches[0].clientY;else if(e.touches.length===2){const t=e.touches[0].clientX-e.touches[1].clientX,i=e.touches[0].clientY-e.touches[1].clientY;this.touchStartDistance=Math.sqrt(t*t+i*i)}e.preventDefault()}handleTouchMove(e){if(e.touches.length===1&&this.isTouching){const t=e.touches[0].clientX-this.lastTouchX,i=e.touches[0].clientY-this.lastTouchY;this.lastTouchX=e.touches[0].clientX,this.lastTouchY=e.touches[0].clientY,this.simulateMouseDrag(t,i)}else if(e.touches.length===2){const t=e.touches[0].clientX-e.touches[1].clientX,i=e.touches[0].clientY-e.touches[1].clientY,n=Math.sqrt(t*t+i*i);if(this.touchStartDistance>0){const r=n-this.touchStartDistance;this.simulateMouseWheel(-r*2)}this.touchStartDistance=n}e.preventDefault()}handleTouchEnd(e){e.touches.length===0?(this.isTouching=!1,this.touchStartDistance=0):e.touches.length===1&&(this.lastTouchX=e.touches[0].clientX,this.lastTouchY=e.touches[0].clientY,this.touchStartDistance=0),e.preventDefault()}simulateMouseDrag(e,t){const i=document.getElementById("canvas-container");if(!i)return;const n=new MouseEvent("mousedown",{button:0,clientX:this.lastTouchX-e,clientY:this.lastTouchY-t,bubbles:!0});i.dispatchEvent(n);const r=new MouseEvent("mousemove",{clientX:this.lastTouchX,clientY:this.lastTouchY,bubbles:!0});i.dispatchEvent(r)}simulateMouseWheel(e){const t=document.getElementById("canvas-container");if(!t)return;const i=new WheelEvent("wheel",{deltaY:e,bubbles:!0});t.dispatchEvent(i)}setUIVisibility(e){this.container&&this.container.classList.toggle("ui-hidden",!e)}}const Hl={star:{mass:eo,radius:ug,color:16768324,luminosity:1,effectiveTemperature:5778,rotationPeriod:25.4*86400},planet:{mass:xc,radius:_c,color:4491519,rotationPeriod:86400},moon:{mass:hg,radius:dg,color:8947848,rotationPeriod:27.3*86400},asteroid:{mass:1e15,radius:1e4,color:9205843,rotationPeriod:5*3600},comet:{mass:1e13,radius:5e3,color:13426175,rotationPeriod:10*3600},spacecraft:{mass:1e4,radius:10,color:16777215,rotationPeriod:0}};class x0{container;isOpen=!1;selectedType="planet";params;bodyCounter=0;buildModeEnabled=!1;onParamsChange;onSpawn;onPanelClose;onGetBodies;onDeleteBody;onBuildModeRequired;constructor(e,t,i,n,r,a){this.onParamsChange=e,this.onSpawn=t,this.onPanelClose=i,this.onGetBodies=n,this.onDeleteBody=r,this.onBuildModeRequired=a,this.params=this.createDefaultParams("planet"),this.container=this.createUI(),document.body.appendChild(this.container),this.setupKeyboardShortcut(),this.setupDrag()}createDefaultParams(e){const t=Hl[e];return{type:e,name:`${e.charAt(0).toUpperCase()+e.slice(1)} ${++this.bodyCounter}`,mass:t.mass,radius:t.radius,color:t.color,x:0,y:0,z:0,vx:0,vy:0,vz:0,contributesToPhysics:!0,isMassive:e!=="spacecraft",luminosity:t.luminosity,effectiveTemperature:t.effectiveTemperature,axialTilt:0,rotationPeriod:t.rotationPeriod??86400,hasAtmosphere:!1,hasRings:!1,atmosphereHeight:6e4,atmosphereRayleighR:.005,atmosphereRayleighG:.012,atmosphereRayleighB:.03,atmosphereMieColor:16777215,atmosphereMieWeight:.001}}createUI(){const e=document.createElement("div");e.id="build-panel",e.innerHTML=`
            <div class="build-header">
                <h2>Build</h2>
                <button class="build-close" title="Close (B)">&times;</button>
            </div>

            <div class="build-tabs">
                <button class="build-tab active" data-tab="basic">Basic</button>
                <button class="build-tab" data-tab="orbit">Orbit</button>
                <button class="build-tab" data-tab="props">Props</button>
                <button class="build-tab" data-tab="bodies">Bodies</button>
            </div>

            <div class="build-content active" id="tab-basic">
                <section class="build-section">
                    <h3>Type</h3>
                    <div class="build-type-grid">
                        <button class="build-type-btn" data-type="star">Star</button>
                        <button class="build-type-btn active" data-type="planet">Planet</button>
                        <button class="build-type-btn" data-type="moon">Moon</button>
                        <button class="build-type-btn" data-type="asteroid">Asteroid</button>
                        <button class="build-type-btn" data-type="comet">Comet</button>
                        <button class="build-type-btn" data-type="spacecraft">Craft</button>
                    </div>
                </section>

                <section class="build-section">
                    <h3>Identity</h3>
                    <div class="build-field">
                        <label>Name</label>
                        <input type="text" id="build-name" value="Planet 1">
                    </div>
                    <div class="build-row">
                        <div class="build-field-sm">
                            <label>Color</label>
                            <input type="color" id="build-color" value="#4488ff">
                        </div>
                    </div>
                </section>

                <section class="build-section">
                    <h3>Physical</h3>
                    <div class="build-field">
                        <label>Mass (kg)</label>
                        <input type="text" id="build-mass" value="${xc.toExponential(3)}">
                    </div>
                    <div class="build-field">
                        <label>Radius (m)</label>
                        <input type="text" id="build-radius" value="${_c.toExponential(3)}">
                    </div>
                </section>

                <section class="build-section">
                    <h3>Physics</h3>
                    <div class="build-row">
                        <label class="build-toggle">
                            <input type="checkbox" id="build-physics" checked>
                            <span>Simulated</span>
                        </label>
                        <label class="build-toggle">
                            <input type="checkbox" id="build-massive" checked>
                            <span>Massive</span>
                        </label>
                    </div>
                </section>
            </div>

            <div class="build-content" id="tab-orbit" style="display: none;">
                <section class="build-section">
                    <h3>Position (AU)</h3>
                    <div class="build-row-3">
                        <div class="build-field-col">
                            <label>X</label>
                            <input type="number" id="build-x" value="0" step="0.1">
                        </div>
                        <div class="build-field-col">
                            <label>Y</label>
                            <input type="number" id="build-y" value="0" step="0.1">
                        </div>
                        <div class="build-field-col">
                            <label>Z</label>
                            <input type="number" id="build-z" value="0" step="0.1">
                        </div>
                    </div>
                </section>

                <section class="build-section">
                    <h3>Velocity (km/s)</h3>
                    <div class="build-row-3">
                        <div class="build-field-col">
                            <label>Vx</label>
                            <input type="number" id="build-vx" value="0" step="0.1">
                        </div>
                        <div class="build-field-col">
                            <label>Vy</label>
                            <input type="number" id="build-vy" value="0" step="0.1">
                        </div>
                        <div class="build-field-col">
                            <label>Vz</label>
                            <input type="number" id="build-vz" value="0" step="0.1">
                        </div>
                    </div>
                    <button class="build-btn-small" id="build-calc-orbital">Calc Circular Orbit</button>
                </section>
            </div>

            <div class="build-content" id="tab-props" style="display: none;">
                <section class="build-section" id="build-star-section">
                    <h3>Star Properties</h3>
                    <div class="build-row" style="margin-bottom: 12px;">
                        <label class="build-toggle">
                            <input type="checkbox" id="build-star-derive" checked>
                            <span>Auto-Derive (Main Sequence)</span>
                        </label>
                    </div>
                    <div id="build-star-manual-props" style="display: none;">
                        <div class="build-field">
                            <label>Luminosity (L☉)</label>
                            <input type="number" id="build-luminosity" value="1.0" step="0.01" min="0">
                        </div>
                        <div class="build-field">
                            <label>Temperature (K)</label>
                            <input type="number" id="build-temperature" value="5778" step="100" min="1000">
                        </div>
                    </div>
                </section>

                <section class="build-section">
                    <h3>Rotation</h3>
                    <div class="build-field">
                        <label>Axial Tilt (deg)</label>
                        <input type="number" id="build-tilt" value="0" step="1" min="-180" max="180">
                    </div>
                    <div class="build-field">
                        <label>Rotation Period (hours)</label>
                        <input type="number" id="build-rotation" value="24" step="0.1" min="0">
                    </div>
                </section>

                <section class="build-section" id="build-atmo-section">
                    <h3>Atmosphere</h3>
                    <div class="build-row">
                        <label class="build-toggle">
                            <input type="checkbox" id="build-has-atmo">
                            <span>Enable Atmosphere</span>
                        </label>
                    </div>
                    <div id="build-atmo-props" style="display: none; margin-top: 6px;">
                        <div class="build-field">
                            <label>Base Config</label>
                            <select id="build-atmo-preset">
                                <option value="earth">Earth-like</option>
                                <option value="mars">Mars-like</option>
                                <option value="venus">Venus-like</option>
                                <option value="titan">Titan-like</option>
                            </select>
                        </div>
                        <div class="build-field">
                            <label>Height (km)</label>
                            <input type="number" id="build-atmo-height" value="60" step="1" min="0">
                        </div>
                        <div class="build-row-3">
                            <div class="build-field-col">
                                <label>Rayleigh R</label>
                                <input type="number" id="build-atmo-rr" value="0.005" step="0.001">
                            </div>
                            <div class="build-field-col">
                                <label>Rayleigh G</label>
                                <input type="number" id="build-atmo-rg" value="0.012" step="0.001">
                            </div>
                            <div class="build-field-col">
                                <label>Rayleigh B</label>
                                <input type="number" id="build-atmo-rb" value="0.03" step="0.001">
                            </div>
                        </div>
                        <div class="build-row" style="margin-top: 6px;">
                            <div class="build-field-sm">
                                <label>Mie Color</label>
                                <input type="color" id="build-atmo-mie-color" value="#ffffff">
                            </div>
                            <div class="build-field-col">
                                <label>Mie Weight</label>
                                <input type="number" id="build-atmo-mie-weight" value="0.001" step="0.0001">
                            </div>
                        </div>
                    </div>
                </section>

                <section class="build-section" id="build-rings-section">
                    <h3>Rings</h3>
                    <label class="build-toggle">
                        <input type="checkbox" id="build-has-rings">
                        <span>Has Rings (Saturn-like)</span>
                    </label>
                </section>
            </div>

            <div class="build-content" id="tab-bodies" style="display: none;">
                <div class="build-body-list" id="build-body-list">
                    <p class="build-body-empty">No bodies yet</p>
                </div>
            </div>

            <div class="build-footer">
                <button class="build-btn-spawn" id="build-spawn">Spawn Body</button>
            </div>
        `;const t=document.createElement("style");return t.textContent=`
            #build-panel {
                position: fixed;
                top: 20px;
                left: 20px;
                width: 260px;
                background: ${O.surface.panelBg};
                -webkit-backdrop-filter: blur(16px) saturate(180%);
                backdrop-filter: blur(16px) saturate(180%);
                border: 1px solid ${O.surface.cardBorder};
                box-shadow: ${O.surface.panelShadow};
                border-radius: 12px;
                color: ${O.text.primary};
                font-family: 'Segoe UI', system-ui, sans-serif;
                font-size: 13px;
                z-index: 200;
                display: none;
                flex-direction: column;
                overflow: hidden;
            }
            
            #build-panel.open { display: flex; }
            
            .build-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 12px;
                border-bottom: 1px solid ${O.surface.cardBorder};
                background: ${O.surface.headerBg};
                cursor: move;
                user-select: none;
            }
            
            .build-header h2 {
                font-size: 14px;
                font-weight: 600;
                margin: 0;
                color: ${O.accent.primary};
            }
            
            .build-close {
                background: none;
                border: none;
                color: ${O.text.disabled};
                font-size: 20px;
                cursor: pointer;
                padding: 0 5px;
                line-height: 1;
            }
            
            .build-close:hover { color: ${O.text.primary}; }

            .build-tabs {
                display: flex;
                background: rgba(0, 0, 0, 0.2);
                border-bottom: 1px solid ${O.surface.cardBorder};
            }

            .build-tab {
                flex: 1;
                background: none;
                border: none;
                color: ${O.text.subtle};
                padding: 8px 0;
                font-size: 11px;
                font-weight: 600;
                cursor: pointer;
                border-bottom: 2px solid transparent;
                transition: color 0.2s, border-color 0.2s;
            }

            .build-tab:hover {
                color: ${O.text.primary};
                background: ${O.surface.buttonBg};
            }

            .build-tab.active {
                color: ${O.accent.primary};
                border-bottom-color: ${O.accent.primary};
            }
            
            .build-content { 
                padding: 10px 12px; 
                display: none;
                overflow-y: auto;
                max-height: calc(100vh - 80px);
            }
            .build-content.active { display: block; }
            
            .build-section {
                margin-bottom: 10px;
            }
            
            .build-section:last-child { margin-bottom: 0; }
            
            .build-section h3 {
                font-size: 10px;
                font-weight: 600;
                color: ${O.text.disabled};
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin: 0 0 6px 0;
            }
            
            .build-type-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 4px;
            }
            
            .build-type-btn {
                padding: 5px 2px;
                background: ${O.surface.buttonBg};
                border: 1px solid ${O.surface.cardBorder};
                border-radius: 4px;
                color: #ccc;
                font-size: 10px;
                cursor: pointer;
                transition: all 0.15s;
            }
            
            .build-type-btn:hover {
                background: ${O.surface.buttonHoverBg};
                border-color: ${O.surface.inputBorder};
            }
            
            .build-type-btn.active {
                background: rgba(79, 195, 247, 0.2);
                border-color: ${O.accent.primaryMuted};
                color: ${O.accent.primary};
            }

            .build-row {
                display: flex;
                gap: 8px;
                margin-bottom: 4px;
            }

            .build-row-3 {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 6px;
            }

            .build-toggle {
                display: flex;
                align-items: center;
                gap: 4px;
                cursor: pointer;
            }

            .build-toggle input[type="checkbox"] {
                width: 14px;
                height: 14px;
                accent-color: ${O.accent.primary};
                margin: 0;
            }

            .build-toggle span {
                font-size: 11px;
                color: ${O.text.secondary};
            }
            
            .build-field {
                margin-bottom: 6px;
            }

            .build-field-sm {
                flex: 1;
            }

            .build-field-col {
                display: flex;
                flex-direction: column;
            }
            
            .build-field label,
            .build-field-sm label,
            .build-field-col label {
                display: block;
                font-size: 10px;
                color: ${O.text.subtle};
                margin-bottom: 3px;
            }
            
            .build-field input[type="text"],
            .build-field input[type="number"],
            .build-field-col input,
            .build-field select {
                width: 100%;
                padding: 5px 6px;
                background: ${O.surface.inputBg};
                border: 1px solid ${O.surface.cardBorder};
                border-radius: 4px;
                color: ${O.text.primary};
                font-size: 11px;
                box-sizing: border-box;
            }
            
            .build-field input[type="color"],
            .build-field-sm input[type="color"] {
                width: 100%;
                height: 26px;
                padding: 2px;
                background: ${O.surface.inputBg};
                border: 1px solid ${O.surface.cardBorder};
                border-radius: 4px;
                cursor: pointer;
            }
            
            .build-field input:focus,
            .build-field-col input:focus {
                outline: none;
                border-color: ${O.accent.primaryMuted};
            }

            .build-btn-small {
                width: 100%;
                padding: 6px;
                margin-top: 6px;
                background: rgba(79, 195, 247, 0.1);
                border: 1px solid ${O.accent.primaryMuted};
                border-radius: 4px;
                color: ${O.accent.primary};
                font-size: 10px;
                cursor: pointer;
                transition: all 0.15s;
                box-sizing: border-box;
            }

            .build-btn-small:hover {
                background: rgba(79, 195, 247, 0.2);
            }

            .build-footer {
                padding: 10px 12px;
                border-top: 1px solid ${O.surface.cardBorder};
                background: rgba(0, 0, 0, 0.2);
            }
            
            .build-btn-spawn {
                width: 100%;
                padding: 10px;
                background: linear-gradient(135deg, rgba(79, 195, 247, 0.3), rgba(79, 195, 247, 0.1));
                border: 1px solid ${O.accent.primaryMuted};
                border-radius: 6px;
                color: ${O.accent.primary};
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.15s;
                box-sizing: border-box;
            }
            
            .build-btn-spawn:hover {
                background: linear-gradient(135deg, rgba(79, 195, 247, 0.4), rgba(79, 195, 247, 0.2));
                border-color: ${O.accent.primary};
            }

            #build-star-section.hidden { display: none; }

            .build-body-list {
                max-height: 300px;
                overflow-y: auto;
            }

            .build-body-empty {
                color: rgba(255, 255, 255, 0.4);
                text-align: center;
                padding: 20px;
                margin: 0;
                font-size: 12px;
            }

            .build-body-item {
                display: flex;
                align-items: center;
                padding: 6px 8px;
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 4px;
                margin-bottom: 4px;
                gap: 8px;
            }

            .build-body-item:last-child {
                margin-bottom: 0;
            }

            .build-body-color {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                flex-shrink: 0;
            }

            .build-body-info {
                flex: 1;
                min-width: 0;
            }

            .build-body-name {
                font-size: 11px;
                font-weight: 500;
                color: #fff;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .build-body-type {
                font-size: 9px;
                color: rgba(255, 255, 255, 0.5);
                text-transform: uppercase;
            }

            .build-body-actions {
                display: flex;
                gap: 4px;
                flex-shrink: 0;
            }

            .build-body-btn {
                padding: 3px 6px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 3px;
                color: rgba(255, 255, 255, 0.7);
                font-size: 9px;
                cursor: pointer;
                transition: all 0.15s;
            }

            .build-body-btn:hover {
                background: rgba(255, 255, 255, 0.1);
                color: #fff;
            }

            .build-body-btn.delete {
                color: #ff6b6b;
                border-color: rgba(255, 107, 107, 0.3);
            }

            .build-body-btn.delete:hover {
                background: rgba(255, 107, 107, 0.2);
                border-color: rgba(255, 107, 107, 0.5);
            }
        `,document.head.appendChild(t),this.setupEventListeners(e),e}setupEventListeners(e){e.querySelector(".build-close")?.addEventListener("click",()=>{this.close()}),e.querySelectorAll(".build-tab").forEach(i=>{i.addEventListener("click",n=>{const r=n.target.dataset.tab;r&&this.switchTab(r)})}),e.querySelectorAll(".build-type-btn").forEach(i=>{i.addEventListener("click",n=>{const r=n.target.dataset.type;r&&this.selectType(r)})}),["build-name","build-mass","build-radius","build-color","build-x","build-y","build-z","build-vx","build-vy","build-vz","build-star-derive","build-luminosity","build-temperature","build-physics","build-massive","build-tilt","build-rotation","build-has-atmo","build-has-rings","build-atmo-height","build-atmo-rr","build-atmo-rg","build-atmo-rb","build-atmo-mie-color","build-atmo-mie-weight"].forEach(i=>{const n=e.querySelector(`#${i}`);n?.addEventListener("input",()=>this.updateParamsFromUI()),n?.addEventListener("change",()=>this.updateParamsFromUI())}),e.querySelector("#build-spawn")?.addEventListener("click",()=>{this.triggerSpawn()}),e.querySelector("#build-calc-orbital")?.addEventListener("click",()=>{this.calculateOrbitalVelocity()})}switchTab(e){this.container.querySelectorAll(".build-tab").forEach(t=>{t.classList.toggle("active",t.dataset.tab===e)}),this.container.querySelectorAll(".build-content").forEach(t=>{const i=t.id===`tab-${e}`;t.classList.toggle("active",i),t.style.display=i?"block":"none"}),e==="bodies"&&this.refreshBodyList()}refreshBodyList(){const e=this.container.querySelector("#build-body-list");if(!e)return;const t=this.onGetBodies?.()??[];if(t.length===0){e.innerHTML='<p class="build-body-empty">No bodies yet</p>';return}e.innerHTML=t.map(i=>`
            <div class="build-body-item" data-body-id="${i.id}">
                <div class="build-body-color" style="background: #${i.color.toString(16).padStart(6,"0")};"></div>
                <div class="build-body-info">
                    <div class="build-body-name">${i.name}</div>
                    <div class="build-body-type">${i.type}</div>
                </div>
                <div class="build-body-actions">
                    <button class="build-body-btn delete" data-action="delete" data-id="${i.id}" title="Delete">✕</button>
                </div>
            </div>
        `).join(""),e.querySelectorAll(".build-body-btn.delete").forEach(i=>{i.addEventListener("click",n=>{n.stopPropagation();const r=parseInt(i.dataset.id??"0");r>0&&(this.onDeleteBody?.(r),this.refreshBodyList())})})}setupKeyboardShortcut(){window.addEventListener("keydown",e=>{if(!(e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement)&&((e.key==="b"||e.key==="B")&&(this.buildModeEnabled?this.toggle():this.onBuildModeRequired?.()),e.key==="Escape"&&this.isOpen)){if(this.buildModeEnabled&&this.params.y!==0){this.setCoordinates(this.params.x,0,this.params.z);return}this.close()}})}selectType(e){this.selectedType=e,this.container.querySelectorAll(".build-type-btn").forEach(h=>{h.classList.toggle("active",h.dataset.type===e)});const t=Hl[e],i=this.container.querySelector("#build-name"),n=this.container.querySelector("#build-mass"),r=this.container.querySelector("#build-radius"),a=this.container.querySelector("#build-color"),o=this.container.querySelector("#build-massive"),l=this.container.querySelector("#build-rotation"),c=this.container.querySelector("#build-has-atmo");i.value=`${e.charAt(0).toUpperCase()+e.slice(1)} ${this.bodyCounter+1}`,n.value=t.mass.toExponential(3),r.value=t.radius.toExponential(3),a.value="#"+t.color.toString(16).padStart(6,"0"),o.checked=e!=="spacecraft",l.value=((t.rotationPeriod??86400)/3600).toFixed(1),e==="star"&&t.luminosity!==void 0&&(this.container.querySelector("#build-luminosity").value=t.luminosity.toString(),this.container.querySelector("#build-temperature").value=(t.effectiveTemperature??5778).toString()),e==="planet"?(c.checked=!0,this.container.querySelector("#build-atmo-props").setAttribute("style","display: block; margin-top: 6px;")):(c.checked=!1,this.container.querySelector("#build-atmo-props").setAttribute("style","display: none; margin-top: 6px;")),this.updateParamsFromUI()}updateParamsFromUI(){const e=this.container.querySelector("#build-name"),t=this.container.querySelector("#build-mass"),i=this.container.querySelector("#build-radius"),n=this.container.querySelector("#build-color"),r=this.container.querySelector("#build-x"),a=this.container.querySelector("#build-y"),o=this.container.querySelector("#build-z"),l=this.container.querySelector("#build-vx"),c=this.container.querySelector("#build-vy"),h=this.container.querySelector("#build-vz"),d=this.container.querySelector("#build-physics"),f=this.container.querySelector("#build-massive"),p=this.container.querySelector("#build-has-rings"),g=this.container.querySelector("#build-star-derive"),y=this.container.querySelector("#build-star-manual-props");y&&g&&(y.style.display=g.checked?"none":"block"),this.params={type:this.selectedType,name:e.value,mass:parseFloat(t.value)||0,radius:parseFloat(i.value)||1,color:parseInt(n.value.slice(1),16),x:(parseFloat(r.value)||0)*Ze,y:(parseFloat(a.value)||0)*Ze,z:(parseFloat(o.value)||0)*Ze,vx:(parseFloat(l.value)||0)*1e3,vy:(parseFloat(c.value)||0)*1e3,vz:(parseFloat(h.value)||0)*1e3,contributesToPhysics:d.checked,isMassive:f.checked,starDerive:g?g.checked:!0,luminosity:g&&g.checked?0:parseFloat(this.container.querySelector("#build-luminosity").value)||1,effectiveTemperature:g&&g.checked?0:parseFloat(this.container.querySelector("#build-temperature").value)||5778,axialTilt:parseFloat(this.container.querySelector("#build-tilt").value)||0,rotationPeriod:(parseFloat(this.container.querySelector("#build-rotation").value)||24)*3600,hasAtmosphere:this.container.querySelector("#build-has-atmo").checked,hasRings:p?p.checked:!1,atmosphereHeight:(parseFloat(this.container.querySelector("#build-atmo-height").value)||60)*1e3,atmosphereRayleighR:parseFloat(this.container.querySelector("#build-atmo-rr").value)||.005,atmosphereRayleighG:parseFloat(this.container.querySelector("#build-atmo-rg").value)||.012,atmosphereRayleighB:parseFloat(this.container.querySelector("#build-atmo-rb").value)||.03,atmosphereMieColor:parseInt(this.container.querySelector("#build-atmo-mie-color").value.replace("#",""),16),atmosphereMieWeight:parseFloat(this.container.querySelector("#build-atmo-mie-weight").value)||.001};const m=this.container.querySelector("#build-atmo-props");m.style.display=this.params.hasAtmosphere?"block":"none",this.onParamsChange?.(this.params)}calculateOrbitalVelocity(){const e=Math.sqrt(this.params.x**2+this.params.y**2+this.params.z**2);if(e<1e6){Le.warn("Position too close to origin for orbital calculation");return}const i=Math.sqrt(Ua*eo/e),n=this.params.x,r=this.params.z,a=Math.sqrt(n*n+r*r);if(a>0){const o=-r/a*i,l=n/a*i;this.container.querySelector("#build-vx").value=(o/1e3).toFixed(3),this.container.querySelector("#build-vy").value="0",this.container.querySelector("#build-vz").value=(l/1e3).toFixed(3),this.updateParamsFromUI()}}setCoordinates(e,t,i){const n=this.container.querySelector("#build-x"),r=this.container.querySelector("#build-y"),a=this.container.querySelector("#build-z");n&&r&&a&&(n.value=(e/Ze).toFixed(4),r.value=(t/Ze).toFixed(4),a.value=(i/Ze).toFixed(4),this.updateParamsFromUI())}triggerSpawn(){this.updateParamsFromUI(),this.bodyCounter++,this.onSpawn?.(this.params);const e=this.container.querySelector("#build-name");e.value=`${this.selectedType.charAt(0).toUpperCase()+this.selectedType.slice(1)} ${this.bodyCounter+1}`,this.updateParamsFromUI()}setPosition(e,t,i){this.container.querySelector("#build-x").value=(e/Ze).toFixed(4),this.container.querySelector("#build-y").value=(t/Ze).toFixed(4),this.container.querySelector("#build-z").value=(i/Ze).toFixed(4),this.updateParamsFromUI()}setupDrag(){let e=0,t=0,i=0,n=0,r=!1;const a=l=>{if(!r)return;const c=l.clientX-e,h=l.clientY-t;this.container.style.left=`${i+c}px`,this.container.style.top=`${n+h}px`},o=()=>{r=!1,document.removeEventListener("mousemove",a),document.removeEventListener("mouseup",o)};this.container.addEventListener("mousedown",l=>{if(l.target.closest("input, select, button, textarea, label, summary, a, option, [contenteditable], .build-tab-btn, .tab-btn")||l.button!==0)return;const h=this.container.getBoundingClientRect();e=l.clientX,t=l.clientY,i=h.left,n=h.top,this.container.style.left=`${h.left}px`,this.container.style.top=`${h.top}px`,this.container.style.right="auto",r=!0,document.addEventListener("mousemove",a),document.addEventListener("mouseup",o)})}toggle(){this.isOpen?this.close():this.open()}open(){this.isOpen=!0,this.container.classList.add("open"),this.updateParamsFromUI()}close(){this.isOpen=!1,this.container.classList.remove("open"),this.onPanelClose?.()}isVisible(){return this.isOpen}getParams(){return{...this.params}}reset(){this.bodyCounter=0,this.selectType("planet"),this.container.querySelector("#build-x").value="0",this.container.querySelector("#build-y").value="0",this.container.querySelector("#build-z").value="0",this.container.querySelector("#build-vx").value="0",this.container.querySelector("#build-vy").value="0",this.container.querySelector("#build-vz").value="0",this.switchTab("basic")}setBuildMode(e){this.buildModeEnabled=e}hide(){this.container.style.display="none"}show(){this.container.style.display=""}}function Vs(s){return Math.sqrt(s[0]*s[0]+s[1]*s[1]+s[2]*s[2])}class _0{ref=null;els={};lastDomUpdate=0;constructor(){this.cacheElements()}cacheElements(){const e=["drift-energy","drift-momentum","drift-angular","drift-com","drift-steps"];for(const t of e)this.els[t]=document.getElementById(t)}reset(e,t){const i=e.totalMomentum(),n=e.angularMomentum(),r=e.centerOfMass(),a=e.kineticEnergy(),l=e.getBodies().reduce((c,h)=>c+h.mass,0);this.ref={energy:e.totalEnergy(),kineticEnergy:a,potentialEnergy:e.potentialEnergy(),momentumMag:Vs(i),angularMomentumMag:Vs(n),characteristicMomentum:Math.sqrt(2*l*Math.abs(a)),comX:r[0],comY:r[1],comZ:r[2],tick:t}}compute(e,t){if(!this.ref)return null;const i=e.totalEnergy(),n=e.kineticEnergy(),r=e.potentialEnergy(),a=e.totalMomentum(),o=e.angularMomentum(),l=e.centerOfMass(),c=Vs(a),h=Vs(o),d=this.ref.energy!==0?(i-this.ref.energy)/Math.abs(this.ref.energy):0,f=Math.max(this.ref.characteristicMomentum,1e-30),p=Math.abs(c-this.ref.momentumMag)/f,g=Math.max(this.ref.angularMomentumMag,1e-30),y=Math.abs(h-this.ref.angularMomentumMag)/g,m=l[0]-this.ref.comX,u=l[1]-this.ref.comY,v=l[2]-this.ref.comZ,_=Math.sqrt(m*m+u*u+v*v);return{energyDrift:d,momentumDrift:p,angularDrift:y,comDrift:_,kineticEnergy:n,potentialEnergy:r,totalEnergy:i,momentumMag:c,angularMag:h,stepsSinceReset:t-this.ref.tick}}update(e,t){const i=performance.now();if(i-this.lastDomUpdate<bc)return;const n=this.compute(e,t);if(!n)return;this.lastDomUpdate=i,this.setDriftCell("drift-energy",n.energyDrift),this.setDriftCell("drift-momentum",n.momentumDrift),this.setDriftCell("drift-angular",n.angularDrift);const r=1496e8,a=this.els["drift-com"];a&&(a.textContent=n.comDrift<r?`${(n.comDrift/1e3).toExponential(2)} km`:`${(n.comDrift/r).toExponential(2)} AU`);const o=this.els["drift-steps"];o&&(o.textContent=n.stepsSinceReset.toLocaleString())}setDriftCell(e,t){const i=this.els[e];if(!i)return;const n=Math.abs(t);i.textContent=t.toExponential(2),n<1e-10?i.style.color=O.status.good:n<1e-6?i.style.color=O.status.excellent:n<.001?i.style.color=O.status.paused:i.style.color=O.status.critical}}class b0{mediaRecorder=null;recordedChunks=[];isRecording=!1;canvas;onRecordingStateChange;constructor(e){this.canvas=e}toggleRecording(){this.isRecording?this.stopRecording():this.startRecording()}startRecording(){if(!this.isRecording)try{const e=this.canvas.captureStream(60),t={mimeType:"video/webm;codecs=vp9"};MediaRecorder.isTypeSupported(t.mimeType)||(t.mimeType="video/webm"),this.mediaRecorder=new MediaRecorder(e,{mimeType:t.mimeType,videoBitsPerSecond:1e7}),this.recordedChunks=[],this.mediaRecorder.ondataavailable=i=>{i.data&&i.data.size>0&&this.recordedChunks.push(i.data)},this.mediaRecorder.onstop=()=>{this.downloadRecording()},this.mediaRecorder.start(),this.isRecording=!0,this.onRecordingStateChange?.(!0)}catch(e){console.error("Failed to start recording:",e)}}stopRecording(){!this.isRecording||!this.mediaRecorder||(this.mediaRecorder.stop(),this.isRecording=!1,this.onRecordingStateChange?.(!1))}downloadRecording(){if(this.recordedChunks.length===0)return;const e=new Blob(this.recordedChunks,{type:"video/webm"}),t=URL.createObjectURL(e),i=new Date().toISOString().replace(/[:.]/g,"-").slice(0,19);this.triggerDownload(t,`symplectica-capture-${i}.webm`),URL.revokeObjectURL(t),this.recordedChunks=[]}takeScreenshot(e,t,i){e.render(t,i);const n=new Date().toISOString().replace(/[:.]/g,"-").slice(0,19),r=this.canvas.toDataURL("image/png");this.triggerDownload(r,`symplectica-shot-${n}.png`)}takeHighResScreenshot(e,t,i,n=2){const r=this.canvas.clientWidth,a=this.canvas.clientHeight,o=e.getPixelRatio();e.setPixelRatio(o*n),e.setSize(r,a,!1),e.render(t,i);const l=new Date().toISOString().replace(/[:.]/g,"-").slice(0,19),c=this.canvas.toDataURL("image/png");this.triggerDownload(c,`symplectica-hires-${l}.png`),e.setPixelRatio(o),e.setSize(r,a,!1)}triggerDownload(e,t){const i=document.createElement("a");i.style.display="none",i.href=e,i.download=t,document.body.appendChild(i),i.click(),document.body.removeChild(i)}}const qr=ee.adminDefaults.tickRate,zt="local";class S0{scene;renderer;camera;bodyRenderer;network;physics;chat;adminPanel;optionsPanel;touchControls;buildPanel;mediaCapture;buildMode=!1;lastTpsTime=performance.now();lastTpsTick=0;serverTps=0;driftMonitor;currentAdminState=null;state={tick:0,time:0,positions:new Float64Array(0),velocities:new Float64Array(0),energy:0,bodyCount:0};lastEnergyCalcTime=0;ENERGY_CALC_INTERVAL_MS=500;cachedBodyMasses=null;cachedBodies=null;lastFrameTime=0;fpsHistory=[];running=!1;localTickAccumulator=0;localSimMode="tick";lastServerState;lastServerPositions=new Float64Array(0);lastServerVelocities=new Float64Array(0);currentVizOptions={...ee.optionsDefaults};timeController=new a0;uiHidden=!1;timeScaleKeyMultiplier=1;buildRaycaster=new jo;buildMouse=new Te;buildPlane=new Ci(new w(0,1,0),0);isMiddleDragging=!1;lastMiddleDragY=0;hintsVisible=!0;showSimulationParams=!0;showFollowingDetails=!1;showPerfMonitor=!1;frameTiming={total:0,physics:0,render:0,ui:0,stepsThisFrame:0};frameTimingAvg={total:0,physics:0,render:0,ui:0,stepsThisFrame:0};frameTimingSeeded=!1;EMA_ALPHA=.05;lastPerfDomUpdate=0;lastUiDomUpdate=0;lastSimTabUpdate=0;frameDeltas=[];dynamicBudgetMs=16.67;detectedRefreshRate=!1;followBodyIndex=0;lastFollowBodyIndex=-1;freeCamera=!1;freeCamSpeedAuPerSec=ee.cameraDefaults.freeCamSpeedAuPerSec;freeCamRotationDamping=ee.cameraDefaults.freeCamRotationDamping;orbitalRotationDamping=ee.cameraDefaults.orbitalRotationDamping;orbitalZoomDamping=ee.cameraDefaults.orbitalZoomDamping;surfaceCamera=!1;preSurfaceOffset=null;surfaceBodyIndex=-1;surfaceSpeedMps=ee.cameraDefaults.surfaceSpeedMps;surfaceSensitivity=ee.cameraDefaults.surfaceSensitivity;surfaceRotationDamping=ee.cameraDefaults.surfaceRotationDamping;surfaceEyeHeightM=ee.cameraDefaults.surfaceEyeHeightM;freeCamCrosshair=null;raycaster=new jo;skyRenderer;ambientLight;initialFollowDistance=.02*Ze;currentExperimentalOptions={flareFrequencyMode:"fixed",flareBrightness:1,flaresVisible:!0,fixedFlareRate:2,ringQuality:"HighQualityClose",useRealisticTextures:!0,globalIllumination:0,earthshineEnabled:!0};orbitalKeyRotateSpeedRadPerSec=.6;orbitalKeyRollSpeedRadPerSec=.8;orbitalKeyZoomRatePerSec=2.4;moveKeys={KeyW:!1,KeyA:!1,KeyS:!1,KeyD:!1,KeyQ:!1,KeyE:!1,Space:!1,ShiftLeft:!1,ShiftRight:!1};async init(){ze.loadPresets(u0),ze.setDefaultPreset(ee.visualPresetDefault),d0(),ze.registerFeature("bodyRenderer",{}),ze.registerFeatureHooks("bodyRenderer",{defaultParams:{renderScale:1},applyPreset:(e,t)=>({...e,renderScale:t.renderScale})}),ze.subscribe(zt,()=>{this.applyPresetToRenderer()}),this.updateLoadingStatus("Initializing renderer..."),this.initRenderer(),this.applyPresetToRenderer(),this.updateLoadingStatus("Loading physics engine..."),this.driftMonitor=new _0,await this.initPhysics(),this.applyLocalDefaults(),this.updateLoadingStatus("Setting up controls..."),this.initControls(),this.updateLoadingStatus("Connecting to server..."),await this.initNetwork();{this.chat=new i0(this.network),this.setupNetworkHandlers();try{await this.network.connect()}catch(e){Le.warn("Multiplayer server unavailable, running in local mode.",e),this.ensureLocalPreset(ee.visualPresetDefault)}}this.adminPanel=new n0(this.physics,this.timeController,this.network,(e,t,i,n,r)=>{this.loadPresetFromAdmin(e,t,i,n,r)},e=>{this.setLocalSimMode(e)},()=>{if(this.followBodyIndex!==null&&this.followBodyIndex>=0){const e=this.getFollowBody(this.followBodyIndex);if(e){const t=this.bodyRenderer.getBodyRingProfile(e.id);t?this.adminPanel.setRingGeneratorProfile(t):console.warn("Followed body does not have rings.")}}},e=>{if(this.followBodyIndex!==null&&this.followBodyIndex>=0){const t=this.getFollowBody(this.followBodyIndex);t&&this.bodyRenderer.updateBodyRingProfile(t.id,e)}},e=>{let t=`{
  scatteringG: ${e.scatteringG},
  baseOpacity: ${e.baseOpacity},
  stops: [
`;for(const i of e.stops)t+=`    { pos: ${i.pos.toFixed(2)}, color: '${i.color}', alpha: ${i.alpha.toFixed(2)} },
`;t+=`  ]
}`,navigator.clipboard.writeText(t).then(()=>{console.log(`Ring profile copied to clipboard:
`+t)}).catch(i=>{console.error("Failed to copy:",i),console.log(`Ring profile:
`+t)})}),this.optionsPanel=new r0(e=>{this.currentVizOptions={...e},this.applyVisualizationToRenderer(e)},e=>{ze.setPlayerPreset(zt,e);const t=ze.getPresetForPlayer(zt);this.optionsPanel?.setPresetRenderScale(t.renderScale),this.optionsPanel?.setPresetShadowQuality(t.shadowQuality)},(e,t)=>{ze.updatePreset(e,t),this.applyPresetToRenderer()},e=>{this.freeCamSpeedAuPerSec=e},e=>{this.camera.setFreeLookSensitivity(e)},e=>{this.freeCamRotationDamping=e,this.camera.setFreeRotationDamping(e)},e=>{this.surfaceSpeedMps=e},e=>{this.surfaceSensitivity=e,this.camera.setSurfaceLookSensitivity(e)},e=>{this.surfaceRotationDamping=e,this.camera.setSurfaceRotationDamping(e)},e=>{this.surfaceEyeHeightM=e,this.camera.setSurfaceEyeHeight(e)},e=>{this.orbitalRotationDamping=e,this.camera.setOrbitalRotationDamping(e)},e=>{this.orbitalZoomDamping=e,this.camera.setOrbitalZoomDamping(e)},e=>{this.camera.setFov(e)},ee.visualPresetDefault,e=>{this.bodyRenderer.setFlareBrightness(e.flaresVisible?e.flareBrightness:0),this.bodyRenderer.setFlareFrequencyMode(e.flareFrequencyMode),this.bodyRenderer.setFixedFlareRate(e.fixedFlareRate),this.bodyRenderer.setRingQuality(e.ringQuality),this.bodyRenderer.setRealisticTexturesEnabled(e.useRealisticTextures),this.currentExperimentalOptions=e,this.ambientLight&&(this.ambientLight.intensity=e.globalIllumination)}),this.optionsPanel.setPresetRenderScale(ze.getPresetForPlayer(zt).renderScale),this.optionsPanel.setPresetShadowQuality(ze.getPresetForPlayer(zt).shadowQuality),this.optionsPanel.setFreeCamSpeed(ee.cameraDefaults.freeCamSpeedAuPerSec),this.optionsPanel.setFreeCamSensitivity(ee.cameraDefaults.freeCamSensitivity),this.optionsPanel.setFreeCamRotationDamping(ee.cameraDefaults.freeCamRotationDamping),this.optionsPanel.setSurfaceSpeed(ee.cameraDefaults.surfaceSpeedMps),this.optionsPanel.setSurfaceSensitivity(ee.cameraDefaults.surfaceSensitivity),this.optionsPanel.setSurfaceRotationDamping(ee.cameraDefaults.surfaceRotationDamping),this.optionsPanel.setSurfaceEyeHeight(ee.cameraDefaults.surfaceEyeHeightM),this.optionsPanel.setOrbitalRotationDamping(ee.cameraDefaults.orbitalRotationDamping),this.optionsPanel.setOrbitalZoomDamping(ee.cameraDefaults.orbitalZoomDamping),this.camera.setFreeLookSensitivity(ee.cameraDefaults.freeCamSensitivity),this.camera.setFreeRotationDamping(ee.cameraDefaults.freeCamRotationDamping),this.camera.setSurfaceLookSensitivity(ee.cameraDefaults.surfaceSensitivity),this.camera.setSurfaceRotationDamping(ee.cameraDefaults.surfaceRotationDamping),this.camera.setSurfaceEyeHeight(ee.cameraDefaults.surfaceEyeHeightM),this.camera.setOrbitalRotationDamping(ee.cameraDefaults.orbitalRotationDamping),this.camera.setOrbitalZoomDamping(ee.cameraDefaults.orbitalZoomDamping),this.touchControls=new y0({onFollowNext:()=>this.followNextBody(),onFollowPrevious:()=>this.followPreviousBody(),onToggleUI:()=>this.toggleUIVisibility(),onToggleSim:()=>this.toggleSimulationSection("sim"),onToggleFollow:()=>this.toggleSimulationSection("follow"),onToggleFreeCamera:()=>this.toggleFreeCamera(),onOpenChat:()=>this.chat?.openForInput(),onOpenOptions:()=>this.optionsPanel?.toggle(),onOpenAdmin:()=>this.adminPanel?.toggle()}),this.chat?.setTouchControlsCallback(()=>{this.toggleTouchControls();const e=this.isTouchControlsEnabled();return{enabled:e,message:e?"Touch controls enabled":"Touch controls disabled"}}),this.buildPanel=new x0(e=>this.onBuildParamsChange(e),e=>this.onBuildSpawn(e),()=>this.onBuildPanelClose(),()=>this.onGetBodiesForBuildPanel(),e=>this.onDeleteBodyFromBuildPanel(e),()=>this.onBuildModeRequired()),this.hideLoading(),this.isMobileDevice()&&this.showMobileTouchPrompt(),this.start()}applyLocalDefaults(){const e=ee.adminDefaults;this.physics.setTimeStep(e.dt),this.physics.setSubsteps(e.substeps),this.physics.useDirectForce(),this.physics.setCloseEncounterIntegrator(e.closeEncounterIntegrator),this.physics.setCloseEncounterThresholds(e.closeEncounterHillFactor,e.closeEncounterTidalRatio,e.closeEncounterJerkNorm),this.physics.setCloseEncounterLimits(e.closeEncounterMaxSubsetSize,e.closeEncounterMaxTrialSubsteps),this.physics.setCloseEncounterRk45Tolerances(e.closeEncounterRk45AbsTol,e.closeEncounterRk45RelTol),this.physics.setCloseEncounterGaussRadau(e.closeEncounterGaussRadauMaxIters,e.closeEncounterGaussRadauTol),this.timeController.setPhysicsTimestep(e.dt),this.timeController.setSpeedBySimRate(e.timeScale),this.timeController.setPaused(e.paused),this.setLocalSimMode(e.simMode)}async initNetwork(){this.network=new Hg(l0())}setupNetworkHandlers(){this.network.on("welcome",e=>{const t=e.payload;t?.snapshot&&this.applySnapshot(t.snapshot),t?.displayName&&this.chat?.setLocalName(t.displayName),t?.players&&this.chat?.setPlayersList(t.players),t?.config?.adminState&&this.applyAdminState(t.config.adminState),t?.config?.visualPresetDefault&&this.ensureLocalPreset(t.config.visualPresetDefault)}),this.network.on("snapshot",e=>{const t=e.payload;t&&this.applySnapshot(t)}),this.network.on("state",e=>{const t=e.payload;t?.positions&&this.applyServerState(t)}),this.network.on("chat",e=>{const t=e.payload;t?.sender&&t?.text&&this.chat?.onServerMessage(t.sender,t.text)}),this.network.on("admin_state",e=>{const t=e.payload;t&&this.applyAdminState(t)})}applyAdminState(e){this.currentAdminState=e,!(!Number.isFinite(e.dt)||e.dt<=0)&&(!Number.isFinite(e.timeScale)||e.timeScale<=0||!Number.isInteger(e.substeps)||e.substeps<1||(this.physics.setTimeStep(e.dt),this.timeController.setPhysicsTimestep(e.dt),this.timeController.setSpeedBySimRate(e.timeScale),this.timeController.setPaused(e.paused),this.setLocalSimMode(e.simMode),this.physics.setCloseEncounterIntegrator(e.closeEncounterIntegrator),this.physics.setCloseEncounterThresholds(e.closeEncounterHillFactor,e.closeEncounterTidalRatio,e.closeEncounterJerkNorm),this.physics.setCloseEncounterLimits(e.closeEncounterMaxSubsetSize,e.closeEncounterMaxTrialSubsteps),this.physics.setCloseEncounterRk45Tolerances(e.closeEncounterRk45AbsTol,e.closeEncounterRk45RelTol),this.physics.setCloseEncounterGaussRadau(e.closeEncounterGaussRadauMaxIters,e.closeEncounterGaussRadauTol),this.updateTimeScaleUI(),this.adminPanel?.applyServerSettings(e)))}applyVisualizationToRenderer(e){this.bodyRenderer.setShowAtmospheres(e.showAtmospheres),this.bodyRenderer.setShowOrbitTrails(e.showOrbitTrails),this.bodyRenderer.setShowStarLabels(e.showStarLabels),this.bodyRenderer.setShowPlanetLabels(e.showPlanetLabels),this.bodyRenderer.setShowMoonLabels(e.showMoonLabels),this.bodyRenderer.setShowAxisLines(e.showAxisLines),this.bodyRenderer.setShowRefPlane(e.showRefPlane),this.bodyRenderer.setShowRefLine(e.showRefLine),this.bodyRenderer.setShowRefPoint(e.showRefPoint),this.bodyRenderer.setMaxTrailPoints(e.orbitTrailLength),this.bodyRenderer.setGridOptions(e.showGridXY,e.showGridXZ,e.showGridYZ,e.gridSpacing,e.gridSize)}applyPresetToRenderer(){const e=ze.resolveFeatureParams(zt,"bodyRenderer");typeof e.renderScale=="number"&&this.bodyRenderer.setRenderScale(e.renderScale);const t=ze.resolveFeatureParams(zt,"planetRenderer"),i=typeof t.lodBias=="number"?t.lodBias:0,n=Math.max(.5,Math.min(2,1-i));this.bodyRenderer.setSphereSegments(64*n,32*n);const r=ze.resolveFeatureParams(zt,"starRenderer");this.bodyRenderer.setStarRenderOptions({granulationEnabled:typeof r.granulationEnabled=="boolean"?r.granulationEnabled:!0,starspotsEnabled:r.flareQuality==="Ultra",flareQuality:r.flareQuality??"Off"});const a=ze.resolveFeatureParams(zt,"shadowRenderer");a.shadowQuality&&this.bodyRenderer.setShadowQuality(a.shadowQuality)}ensureLocalPreset(e){ze.hasPlayerPreset(zt)||(ze.setDefaultPreset(e),ze.setPlayerPreset(zt,e),this.optionsPanel?.setPreset(e),this.optionsPanel?.setPresetRenderScale(ze.getPresetForPlayer(zt).renderScale),this.optionsPanel?.setPresetShadowQuality(ze.getPresetForPlayer(zt).shadowQuality))}applySnapshot(e){const t=this.physics.bodyCount();if(!this.physics.restoreSnapshot(e)){Le.warn("Failed to apply server snapshot");return}const n=this.physics.bodyCount();n!==t&&this.refreshBodies(),this.state.bodyCount=n,this.updateUIBodyCount(),this.timeController.resetAccumulator(),this.initializeFollowTarget()}applyServerState(e){this.lastServerState=e,this.lastServerPositions=new Float64Array(e.positions),this.lastServerVelocities=new Float64Array(e.velocities)}initRenderer(){this.scene=new ru,this.scene.background=new Ae(5),this.renderer=new cg({antialias:!0,logarithmicDepthBuffer:!0,powerPreference:"high-performance"}),this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,2)),this.renderer.setSize(window.innerWidth,window.innerHeight),this.renderer.toneMapping=Gl,this.renderer.toneMappingExposure=1,document.getElementById("canvas-container").appendChild(this.renderer.domElement),this.freeCamCrosshair=document.getElementById("freecam-crosshair"),this.mediaCapture=new b0(this.renderer.domElement),this.camera=new Eg(ee.cameraDefaults.cameraFov,window.innerWidth/window.innerHeight,.1,1e15),this.camera.setDistance(this.initialFollowDistance),this.camera.setElevation(.5),this.bodyRenderer=new Bl(this.scene),this.skyRenderer=new v0(this.scene,{seed:42}),this.skyRenderer.generate(),this.ambientLight=new Mu(16777215,this.currentExperimentalOptions?.globalIllumination??0),this.scene.add(this.ambientLight),window.addEventListener("resize",()=>this.onResize())}async initPhysics(){this.physics=new t0,await this.physics.init(),this.physics.createPreset(ee.defaultPreset.id,BigInt(Date.now()),ee.defaultPreset.barycentric,void 0),this.onBodiesLoaded()}onBodiesLoaded(){this.state.bodyCount=this.physics.bodyCount(),this.updateUIBodyCount(),this.refreshBodies(),this.initializeFollowTarget(),this.applyInitialFollowCamera(),this.driftMonitor&&this.driftMonitor.reset(this.physics,Number(this.physics.tick()))}refreshBodies(){this.bodyRenderer.dispose(),this.bodyRenderer=new Bl(this.scene),this.applyPresetToRenderer(),this.cachedBodyMasses=null;const e=this.physics.getBodies();this.cachedBodies=e,this.cachedBodyMasses=e.map(n=>n.mass);const t=this.physics.getPositions(),i=this.physics.getVelocities();this.state.positions=t,this.state.velocities=i;for(let n=0;n<e.length;n++){const r=e[n];this.bodyRenderer.addBody(r)}this.applyVisualizationToRenderer(this.currentVizOptions),this.state.bodyCount=this.physics.bodyCount(),this.updateUIBodyCount(),this.updateFollowUI()}initControls(){window.addEventListener("keydown",e=>{if(e.key==="Escape"){document.activeElement?.blur();return}if(!(e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement)){if(this.hasOsShortcutModifier(e)){this.clearMoveKeys();return}if(this.setMoveKey(e.code,!0)){e.preventDefault();return}switch(e.key){case"0":this.followOrigin();break;case"1":this.toggleSimulationSection("sim");break;case"2":this.toggleSimulationSection("follow");break;case"c":case"C":this.toggleFreeCamera();break;case"v":case"V":this.toggleSurfaceCamera();break;case"n":case"N":this.followNextBody();break;case"p":case"P":this.followPreviousBody();break;case"h":case"H":this.toggleUIVisibility();break;case"k":case"K":this.toggleHints();break;case"3":this.togglePerfMonitor();break;case"8":this.mediaCapture.takeScreenshot(this.renderer,this.scene,this.camera);break;case"9":this.mediaCapture.toggleRecording();break}}}),window.addEventListener("keyup",e=>{if(!(e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement)){if(this.hasOsShortcutModifier(e)){this.clearMoveKeys();return}this.setMoveKey(e.code,!1)&&e.preventDefault()}}),window.addEventListener("blur",()=>{this.clearMoveKeys()}),document.getElementById("canvas-container")?.addEventListener("click",()=>{document.activeElement?.blur()}),document.getElementById("canvas-container")?.addEventListener("mousedown",e=>{if(this.buildPanel.isVisible()&&this.buildMode){if(e.button===1){this.isMiddleDragging=!0,this.lastMiddleDragY=e.clientY,e.preventDefault();return}if(e.button===2){this.buildPanel.triggerSpawn(),e.preventDefault();return}}if(!this.freeCamera||e.button!==0)return;const t=this.pickBodyFromCenter();if(t===null)return;const i=this.findBodyIndexById(t);i!==null&&this.switchToFollowBody(i)}),document.getElementById("canvas-container")?.addEventListener("mousemove",e=>{if(this.buildPanel.isVisible()&&this.buildMode){if(this.isMiddleDragging){const o=e.clientY-this.lastMiddleDragY;this.lastMiddleDragY=e.clientY;const l=this.buildPanel.getParams(),c=l.z-o*.002*Ze;this.buildPanel.setCoordinates(l.x,l.y,c);return}const t=this.buildPanel.getParams(),i=this.resolveCameraOrigin(!this.freeCamera&&!this.surfaceCamera),n=t.z-i.z;this.buildPlane.constant=-n;const r=this.renderer.domElement.getBoundingClientRect();this.buildMouse.x=(e.clientX-r.left)/r.width*2-1,this.buildMouse.y=-((e.clientY-r.top)/r.height)*2+1,this.buildRaycaster.setFromCamera(this.buildMouse,this.camera);const a=new w;this.buildRaycaster.ray.intersectPlane(this.buildPlane,a)&&this.buildPanel.setCoordinates(a.x+i.x,-a.z+i.y,t.z)}}),document.getElementById("canvas-container")?.addEventListener("mouseup",e=>{e.button===1&&(this.isMiddleDragging=!1)}),document.getElementById("canvas-container")?.addEventListener("mouseleave",()=>{this.isMiddleDragging=!1}),this.updateSimulationSections(),this.updateTimeScaleUI()}toggleUIVisibility(){this.uiHidden=!this.uiHidden;const e=document.getElementById("ui-layer");e&&(e.style.display=this.uiHidden?"none":"block"),this.touchControls?.setUIVisibility(!this.uiHidden),document.querySelectorAll("#ui-overlay, #chat-panel, #admin-panel, #opt-panel").forEach(n=>{n.style.display=this.uiHidden?"none":""});const i=document.getElementById("perf-overlay");i&&(i.style.display=this.uiHidden||!this.showPerfMonitor?"none":"block"),this.uiHidden?this.buildPanel.hide():this.buildPanel.show()}toggleSimulationSection(e){e==="sim"?this.showSimulationParams=!this.showSimulationParams:this.showFollowingDetails=!this.showFollowingDetails,this.updateSimulationSections()}updateSimulationSections(){const e=document.getElementById("sim-monitor-section"),t=document.getElementById("follow-section");e&&(e.style.display=this.showSimulationParams?"block":"none"),t&&(t.style.display=this.showFollowingDetails?"block":"none")}loadPresetFromAdmin(e,t,i=!1,n,r){e==="worldBuilder"?(this.physics.createNew(BigInt(Date.now())),this.buildMode=!0,this.buildPanel.setBuildMode(!0),this.buildPanel.reset(),this.buildPanel.open(),this.currentVizOptions.showGridXY=!0,this.currentVizOptions.showGridXZ=!0,this.currentVizOptions.showGridYZ=!0,this.applyVisualizationToRenderer(this.currentVizOptions),this.optionsPanel?.applyOptions(this.currentVizOptions),this.camera.configureForScale("solar"),this.camera.setFocus(0,0,0),this.camera.setDistance(.5*Ze),this.camera.setElevation(.5),this.followBodyIndex=-1,this.lastFollowBodyIndex=-1):e==="sunEarthMoon"?(this.buildMode=!1,this.buildPanel.setBuildMode(!1),this.physics.createSunEarthMoon()):(this.buildMode=!1,this.buildPanel.setBuildMode(!1),this.physics.createPreset(e,BigInt(Date.now()),i,n,r));const a=Qg[e]??jg;if(e!=="worldBuilder"&&(this.camera.configureForScale(a.scale),this.skyRenderer.setOptions({skyRadius:a.skyRadius})),e!=="worldBuilder"&&(this.camera.setElevation(.5),this.followBodyIndex=0,this.lastFollowBodyIndex=0),this.timeController.resetAccumulator(),this.state.tick=-1,this.refreshBodies(),this.initializeFollowTarget(),this.applyInitialFollowCamera(),this.driftMonitor&&this.driftMonitor.reset(this.physics,Number(this.physics.tick())),this.network?.isConnected()){const o=this.physics.getSnapshot();this.network.sendSnapshot(o,t)}}toggleFreeCamera(){if(this.freeCamera=!this.freeCamera,this.freeCamera){this.surfaceCamera&&(this.surfaceCamera=!1,this.surfaceBodyIndex=-1,this.camera.setSurfaceMode(!1)),this.lastFollowBodyIndex=this.followBodyIndex,this.followBodyIndex=-1;const e=this.resolveCameraOrigin(!0),t=this.camera.getCameraWorldPosition(),i=new w;this.camera.getWorldDirection(i),this.camera.setFreeMode(!0,t,{x:i.x,y:i.y,z:i.z},e),this.setFreeCamUI(!0)}else{const e=this.camera.getCameraWorldPosition(),t=this.getFollowTargetPosition(this.lastFollowBodyIndex),i={x:e.x-t.x,y:e.y-t.y,z:e.z-t.z},n=this.getFollowBody(this.lastFollowBodyIndex);this.camera.setFreeMode(!1),n&&this.camera.setTrackedBodyRadius(n.radius*this.bodyRenderer.getRenderScale()),this.camera.setFocus(t.x,t.y,t.z),this.camera.setOrbitFromOffset(i),this.followBodyIndex=this.lastFollowBodyIndex,this.setFreeCamUI(!1)}this.updateFollowUI()}toggleSurfaceCamera(){if(this.surfaceCamera){const a=this.surfaceBodyIndex,o=this.camera.getCameraWorldPosition(),l=this.getFollowTargetPosition(a);let c=this.preSurfaceOffset;c||(c={x:o.x-l.x,y:o.y-l.y,z:o.z-l.z});const h=this.getFollowBody(a);this.surfaceCamera=!1,this.surfaceBodyIndex=-1,this.followBodyIndex=a,this.lastFollowBodyIndex=a,this.camera.setSurfaceMode(!1),h&&this.camera.setTrackedBodyRadius(h.radius*this.bodyRenderer.getRenderScale()),this.camera.setFocus(l.x,l.y,l.z),this.camera.setOrbitFromOffset(c),this.updateFollowUI();return}const e=this.followBodyIndex>=0?this.followBodyIndex:this.lastFollowBodyIndex,t=this.getFollowBody(e);if(!t)return;const i=this.getFollowTargetPosition(e),n=this.camera.getCameraWorldPosition();this.preSurfaceOffset={x:n.x-i.x,y:n.y-i.y,z:n.z-i.z};const r=new w;this.camera.getWorldDirection(r),this.freeCamera=!1,this.camera.setFreeMode(!1),this.camera.setSurfaceMode(!0,{center:i,radius:t.radius,rotationRate:t.rotationRate,axialTilt:t.axialTilt,eyeHeight:this.surfaceEyeHeightM,seedWorld:n,seedForward:{x:r.x,y:r.y,z:r.z}}),this.camera.setSurfaceLookSensitivity(this.surfaceSensitivity),this.camera.setSurfaceRotationDamping(this.surfaceRotationDamping),this.surfaceCamera=!0,this.surfaceBodyIndex=e,this.followBodyIndex=e,this.lastFollowBodyIndex=e,this.setFreeCamUI(!1),this.updateFollowUI()}setFreeCamUI(e){this.freeCamCrosshair&&(this.freeCamCrosshair.style.display=e?"block":"none")}resolveCameraOrigin(e){if(e&&this.followBodyIndex>=0&&this.followBodyIndex*3+2<this.state.positions.length)return{x:this.state.positions[this.followBodyIndex*3],y:this.state.positions[this.followBodyIndex*3+1],z:this.state.positions[this.followBodyIndex*3+2]};const t=this.camera.getWorldOrigin();return{x:t.x,y:-t.z,z:t.y}}getFollowTargetPosition(e){if(e>=0&&e*3+2<this.state.positions.length){const t=this.state.positions[e*3],i=this.state.positions[e*3+1],n=this.state.positions[e*3+2];return{x:t,y:n,z:-i}}return{x:0,y:0,z:0}}pickBodyFromCenter(){const e=new Te(0,0);return this.raycaster.setFromCamera(e,this.camera),this.bodyRenderer.pickBodyId(this.raycaster)}findBodyIndexById(e){const i=(this.cachedBodies??this.physics.getBodies()).findIndex(n=>n.id===e);return i>=0?i:null}switchToFollowBody(e){const t=this.camera.getCameraWorldPosition(),i=this.getFollowTargetPosition(e),n={x:t.x-i.x,y:t.y-i.y,z:t.z-i.z},r=this.getFollowBody(e);this.freeCamera=!1,this.camera.setFreeMode(!1),r&&this.camera.setTrackedBodyRadius(r.radius*this.bodyRenderer.getRenderScale()),this.camera.setFocus(i.x,i.y,i.z),this.camera.setOrbitFromOffset(n),this.followBodyIndex=e,this.lastFollowBodyIndex=e,this.setFreeCamUI(!1),this.updateFollowUI()}setMoveKey(e,t){return e in this.moveKeys?(this.moveKeys[e]=t,!0):!1}clearMoveKeys(){for(const e in this.moveKeys)this.moveKeys[e]=!1}hasOsShortcutModifier(e){return e.metaKey||e.getModifierState("OS")}toggleHints(){this.hintsVisible=!this.hintsVisible;const e=document.getElementById("hints-panel");e&&(e.style.display=this.hintsVisible?"block":"none")}togglePerfMonitor(){this.showPerfMonitor=!this.showPerfMonitor;const e=document.getElementById("perf-overlay");e&&(e.style.display=this.showPerfMonitor&&!this.uiHidden?"block":"none")}updatePerfMonitor(){if(!this.showPerfMonitor)return;if(!this.frameTimingSeeded)this.frameTimingAvg.total=this.frameTiming.total,this.frameTimingAvg.physics=this.frameTiming.physics,this.frameTimingAvg.render=this.frameTiming.render,this.frameTimingAvg.ui=this.frameTiming.ui,this.frameTimingAvg.stepsThisFrame=this.frameTiming.stepsThisFrame,this.frameTimingSeeded=!0;else{const F=this.EMA_ALPHA;this.frameTimingAvg.total=F*this.frameTiming.total+(1-F)*this.frameTimingAvg.total,this.frameTimingAvg.physics=F*this.frameTiming.physics+(1-F)*this.frameTimingAvg.physics,this.frameTimingAvg.render=F*this.frameTiming.render+(1-F)*this.frameTimingAvg.render,this.frameTimingAvg.ui=F*this.frameTiming.ui+(1-F)*this.frameTimingAvg.ui,this.frameTimingAvg.stepsThisFrame=F*this.frameTiming.stepsThisFrame+(1-F)*this.frameTimingAvg.stepsThisFrame}const e=performance.now();if(e-this.lastPerfDomUpdate<xg)return;this.lastPerfDomUpdate=e;const t=document.getElementById("perf-frame-time"),i=document.getElementById("perf-physics-time"),n=document.getElementById("perf-render-time"),r=document.getElementById("perf-ui-time"),a=document.getElementById("perf-steps"),o=document.getElementById("perf-bodies"),l=document.getElementById("perf-bar-fill"),c=this.dynamicBudgetMs,h=(F,N,W)=>{if(!F)return;F.classList.remove("perf-good","perf-warn","perf-critical");const $=N/W;$>.85?F.classList.add("perf-critical"):$>.5?F.classList.add("perf-warn"):F.classList.add("perf-good")};if(t&&(t.textContent=`${this.frameTiming.total.toFixed(1)} (${this.frameTimingAvg.total.toFixed(1)}) ms`,h(t,this.frameTimingAvg.total,c)),i){const F=this.network?.isConnected()&&this.lastServerState,N=F?"Physics (server)":"Physics",W=i.closest(".perf-row")?.querySelector(".label");W&&(W.textContent=N),i.textContent=F?"0.0 (0.0) ms":`${this.frameTiming.physics.toFixed(1)} (${this.frameTimingAvg.physics.toFixed(1)}) ms`,h(i,this.frameTimingAvg.physics,c)}if(n&&(n.textContent=`${this.frameTiming.render.toFixed(1)} (${this.frameTimingAvg.render.toFixed(1)}) ms`,h(n,this.frameTimingAvg.render,c)),r&&(r.textContent=`${this.frameTiming.ui.toFixed(1)} (${this.frameTimingAvg.ui.toFixed(1)}) ms`,h(r,this.frameTimingAvg.ui,c)),a){const F=this.network?.isConnected()&&this.lastServerState;a.textContent=F?"---":`${this.frameTiming.stepsThisFrame} (${this.frameTimingAvg.stepsThisFrame.toFixed(1)})`}o&&(o.textContent=this.state.bodyCount.toString());const d=document.getElementById("perf-actual-fps");if(d){const F=this.fpsHistory.length>0?this.fpsHistory.reduce((W,$)=>W+$,0)/this.fpsHistory.length:0,N=Math.round(1e3/this.dynamicBudgetMs);d.textContent=`${F.toFixed(0)} / ${N}`}const f=document.getElementById("perf-server-tps");f&&(f.textContent=`${this.serverTps.toFixed(0)} / ${qr}`);const p=this.renderer.info,g=document.getElementById("perf-draw-calls"),y=document.getElementById("perf-triangles"),m=document.getElementById("perf-geometries"),u=document.getElementById("perf-textures");g&&(g.textContent=p.render.calls.toString()),y&&(y.textContent=p.render.triangles.toLocaleString()),m&&(m.textContent=p.memory.geometries.toString()),u&&(u.textContent=p.memory.textures.toString());const v=this.bodyRenderer.getTrailStats(),_=document.getElementById("perf-line-prims"),x=document.getElementById("perf-line-verts");_&&(_.textContent=v.lineCount.toString()),x&&(x.textContent=v.totalVertices.toLocaleString());const T=document.getElementById("perf-latency");if(T)if(this.network?.isConnected()){const F=this.network.getLatency();T.textContent=F>0?`${F.toFixed(0)} ms`:"pending"}else T.textContent="local";const C=document.getElementById("perf-memory");let A=0;if(C){const F=performance;F.memory?(A=F.memory.usedJSHeapSize/(1024*1024),C.textContent=`${A.toFixed(1)} MB`):C.textContent="N/A"}const P=document.getElementById("perf-bottleneck"),M=document.getElementById("perf-contributors");if(P&&M){let F="None",N="---";this.frameTimingAvg.total>c*.85?this.frameTimingAvg.render>this.frameTimingAvg.physics?(F="GPU Bound",N=`Draw Calls: ${p.render.calls}, Tris: ${(p.render.triangles/1e3).toFixed(0)}k, Tex: ${p.memory.textures}`,P.className="value perf-critical"):(F="CPU Bound",N=`Phys: ${this.frameTimingAvg.physics.toFixed(1)}ms, UI: ${this.frameTimingAvg.ui.toFixed(1)}ms`,A>0&&(N+=`, Mem: ${A.toFixed(1)}MB`),P.className="value perf-critical"):P.className="value perf-good",P.textContent=F,M.textContent=N}const S=document.getElementById("perf-status");if(S){const F=this.timeController.isPaused();this.network?.isConnected()&&this.lastServerState?(S.textContent=F?"SERVER ⏸":"SERVER ▶",S.style.color=F?O.status.paused:O.accent.primary):F?(S.textContent="LOCAL ⏸",S.style.color=O.status.paused):(S.textContent="LOCAL ▶",S.style.color=O.status.good)}const I=Math.min(this.frameTiming.total/c*100,100);l&&(l.style.width=`${I.toFixed(0)}%`)}syncTimeScaleToServer(){if(!this.network?.isConnected())return;const e=this.timeController.getCurrentSpeed().sim;this.network.sendTimeScale(e)}initializeFollowTarget(){const e=this.physics.bodyCount();e>0&&this.followBodyIndex>=e?this.followBodyIndex=0:e===0&&(this.followBodyIndex=-1),this.updateFollowUI()}getFollowBody(e){return(this.cachedBodies??this.physics.getBodies())[e]??null}applyInitialFollowCamera(){if(this.followBodyIndex<0)return;const e=this.getFollowBody(this.followBodyIndex);if(!e)return;const t=this.getFollowTargetPosition(this.followBodyIndex);this.camera.setTrackedBodyRadius(e.radius*this.bodyRenderer.getRenderScale()),this.camera.setFocus(t.x,t.y,t.z),this.camera.setDistance(this.initialFollowDistance),this.lastFollowBodyIndex=this.followBodyIndex}focusFollowBody(e){const t=this.getFollowBody(e);if(!t)return;const i=this.getFollowTargetPosition(e);this.camera.setTrackedBodyRadius(t.radius*this.bodyRenderer.getRenderScale()),this.camera.setFocus(i.x,i.y,i.z),this.followBodyIndex=e,this.lastFollowBodyIndex=e,this.setFreeCamUI(!1),this.updateFollowUI()}followOrigin(){this.followBodyIndex=-1,this.camera.setFocus(0,0,0),this.camera.setMinimumOrbitDistance(1),this.updateFollowUI()}followNextBody(){const e=this.physics.bodyCount();if(e===0)return;const t=(this.followBodyIndex+1)%e;this.focusFollowBody(t)}followPreviousBody(){const e=this.physics.bodyCount();if(e===0)return;const t=(this.followBodyIndex-1+e)%e;this.focusFollowBody(t)}updateFollowUI(){const e=(h,d)=>{const f=document.getElementById(h);f&&(f.textContent=d)},t=(h,d)=>{const f=document.getElementById(h);f&&(f.style.display=d?"flex":"none")},i=(h,d)=>{const f=document.getElementById(h);f&&(f.style.display=d?"block":"none")},n=()=>{for(const h of["follow-type","follow-mass","follow-radius","follow-density","follow-gravity","follow-vesc","follow-rotation","follow-tilt","follow-oblateness","follow-spectral","follow-composition","follow-sma","follow-ecc","follow-albedo","follow-teff","follow-tsurf","follow-teq","follow-luminosity","follow-metallicity","follow-age","follow-lifetime","follow-flare","follow-spot","follow-scaleheight","follow-atmheight"])e(h,"—");for(const h of["follow-row-spectral","follow-row-composition","follow-row-rotation","follow-row-tilt","follow-row-oblateness","follow-row-tsurf","follow-row-teq","follow-row-atm"])t(h,!1);for(const h of["follow-grp-orbital","follow-grp-thermal","follow-grp-star","follow-grp-planet"])i(h,!1)};if(this.freeCamera){e("follow-target","Free"),e("follow-type","Camera"),n();return}const r=this.cachedBodies??this.physics.getBodies();if(this.followBodyIndex<0||this.followBodyIndex>=r.length){e("follow-target","Origin"),n();return}const a=r[this.followBodyIndex],o=a.type==="star",l=a.type==="planet"||a.type==="moon";if(n(),e("follow-target",a.name),e("follow-type",this.formatBodyType(a.type)),e("follow-mass",this.formatMass(a.mass)),e("follow-radius",this.formatRadius(a.radius)),a.mass>0&&a.radius>0){const h=1.3333333333333333*Math.PI*a.radius**3,d=a.mass/h;e("follow-density",d.toFixed(0)+" kg/m³")}if(a.mass>0&&a.radius>0){const h=Ua*a.mass/(a.radius*a.radius);e("follow-gravity",h<100?h.toFixed(2)+" m/s²":h.toExponential(2)+" m/s²")}if(a.mass>0&&a.radius>0){const h=Math.sqrt(2*Ua*a.mass/a.radius);e("follow-vesc",h<1e5?(h/1e3).toFixed(1)+" km/s":h.toExponential(2)+" m/s")}if(a.rotationRate!==0){t("follow-row-rotation",!0);const h=Math.abs(2*Math.PI/a.rotationRate);e("follow-rotation",this.formatDuration(h)+(a.rotationRate<0?" (retro)":""))}if(a.axialTilt!==0&&(t("follow-row-tilt",!0),e("follow-tilt",(a.axialTilt*180/Math.PI).toFixed(2)+"°")),a.oblateness>1e-4&&(t("follow-row-oblateness",!0),e("follow-oblateness",a.oblateness.toFixed(4))),o&&a.spectralType&&(t("follow-row-spectral",!0),e("follow-spectral",a.spectralType)),l&&a.composition&&(t("follow-row-composition",!0),e("follow-composition",{Rocky:"Rocky",GasGiant:"Gas Giant",IceGiant:"Ice Giant",Dwarf:"Dwarf"}[a.composition]||a.composition)),a.semiMajorAxis>0){i("follow-grp-orbital",!0);const h=a.semiMajorAxis/Ze;e("follow-sma",h>=.01?h.toFixed(4)+" AU":this.formatRadius(a.semiMajorAxis)),e("follow-ecc",a.eccentricity.toFixed(4)),e("follow-albedo",a.albedo>0?a.albedo.toFixed(3):"—")}if((a.effectiveTemperature>0||a.meanSurfaceTemperature>0||a.equilibriumTemperature>0)&&(i("follow-grp-thermal",!0),e("follow-teff",a.effectiveTemperature>0?Math.round(a.effectiveTemperature)+" K":"—"),a.meanSurfaceTemperature>0&&(t("follow-row-tsurf",!0),e("follow-tsurf",Math.round(a.meanSurfaceTemperature)+" K")),a.equilibriumTemperature>0&&(t("follow-row-teq",!0),e("follow-teq",Math.round(a.equilibriumTemperature)+" K"))),o){if(i("follow-grp-star",!0),e("follow-luminosity",a.luminosity>0?(a.luminosity/Zs).toFixed(4)+" L☉":"—"),e("follow-metallicity","[Fe/H] = "+(a.metallicity>=0?"+":"")+a.metallicity.toFixed(2)),e("follow-age",a.age>0?this.formatAge(a.age):"—"),a.mass>0&&a.luminosity>0){const h=315576e12*(eo/a.mass)*(Zs/a.luminosity);e("follow-lifetime",this.formatAge(h))}e("follow-flare",a.flareRate>0?a.flareRate.toExponential(1)+" /s":"None"),e("follow-spot",(a.spotFraction*100).toFixed(1)+"%")}l&&(i("follow-grp-planet",!0),e("follow-scaleheight",a.scaleHeight>0?(a.scaleHeight/1e3).toFixed(1)+" km":"—"),a.atmosphere&&(t("follow-row-atm",!0),e("follow-atmheight",(a.atmosphere.height/1e3).toFixed(0)+" km")))}formatAge(e){const t=e/31557600;return t>=1e9?(t/1e9).toFixed(2)+" Gyr":t>=1e6?(t/1e6).toFixed(0)+" Myr":t>=1e3?(t/1e3).toFixed(0)+" kyr":t.toFixed(0)+" yr"}formatDuration(e){return e<3600?e.toFixed(0)+" s":e<86400?(e/3600).toFixed(2)+" hr":e<86400*365.25?(e/86400).toFixed(2)+" d":(e/(86400*365.25)).toFixed(2)+" yr"}updateTimeScaleUI(){const e=document.getElementById("time-warp");e&&(e.textContent=this.timeController.getDisplayLabel())}onResize(){const e=window.innerWidth,t=window.innerHeight;this.camera.aspect=e/t,this.camera.updateProjectionMatrix(),this.renderer.setSize(e,t)}start(){this.running=!0,this.lastFrameTime=performance.now(),this.animate()}animate=()=>{if(!this.running)return;requestAnimationFrame(this.animate);const e=performance.now(),t=(e-this.lastFrameTime)/1e3;if(this.lastFrameTime=e,!this.detectedRefreshRate&&(this.frameDeltas.push(t*1e3),this.frameDeltas.length>=100)){const m=[...this.frameDeltas].sort((v,_)=>v-_),u=m[Math.floor(m.length/2)];u<7.5?this.dynamicBudgetMs=6.94:u<9?this.dynamicBudgetMs=8.33:u<12?this.dynamicBudgetMs=11.11:this.dynamicBudgetMs=16.67,this.detectedRefreshRate=!0}const i=1/t;this.fpsHistory.push(i),this.fpsHistory.length>60&&this.fpsHistory.shift();const n=this.network?.isConnected()&&this.lastServerState,r=performance.now();if(r-this.lastTpsTime>=1e3){const m=Number(this.state.tick-this.lastTpsTick),u=(r-this.lastTpsTime)/1e3;this.serverTps=m/u,this.lastTpsTime=r,this.lastTpsTick=this.state.tick}const a=performance.now();let o=0;if(n)this.state.tick=this.lastServerState.tick,this.state.time=this.lastServerState.time,this.state.positions=this.lastServerPositions,this.state.velocities=this.lastServerVelocities,this.state.energy=this.lastServerState.energy,this.state.bodyCount=Math.floor(this.lastServerPositions.length/3);else{if(!this.timeController.isPaused())if(this.localSimMode==="accumulator"){const u=this.timeController.update(t);u>0&&this.physics.stepN(u),o=u}else if(this.localSimMode==="hybrid"){let u=this.adminPanel.getHybridMaxSteps();const v=this.adminPanel.isHybridBudgeted();if(v){const x=this.frameTimingAvg.stepsThisFrame>0?this.frameTimingAvg.physics/this.frameTimingAvg.stepsThisFrame:.5,T=Math.max(1,Math.floor(5/x));u=Math.min(u,T)}const _=this.timeController.updateHybrid(t,u,v,(x,T)=>{this.physics.setTimeStep(x),this.physics.stepN(T)});_>0&&this.physics.setTimeStep(this.timeController.getPhysicsTimestep()),o=_}else{const u=1/qr;this.localTickAccumulator+=t;const v=10;let _=Math.floor(this.localTickAccumulator/u);if(_>v&&(_=v,this.localTickAccumulator=Math.min(this.localTickAccumulator,v*u)),_>0){const T=this.timeController.getCurrentSpeed().sim/qr;this.physics.setTimeStep(T),this.physics.stepN(_),this.localTickAccumulator-=_*u,this.physics.setTimeStep(this.timeController.getPhysicsTimestep())}o=_}{(o>0||this.state.positions.length===0)&&(this.state.tick=this.physics.tick(),this.state.time=this.physics.time(),this.state.positions=this.physics.getPositions(),this.state.velocities=this.physics.getVelocities());const u=performance.now();(o>0||u-this.lastEnergyCalcTime>this.ENERGY_CALC_INTERVAL_MS)&&(this.state.energy=this.physics.totalEnergy(),this.lastEnergyCalcTime=u)}}const l=performance.now();if(this.frameTiming.physics=l-a,this.frameTiming.stepsThisFrame=o,!this.freeCamera&&!this.surfaceCamera){const m=this.getFollowTargetPosition(this.followBodyIndex);this.camera.setFocus(m.x,m.y,m.z)}if(!this.freeCamera&&!this.surfaceCamera){let m=0,u=0,v=0;const _=this.orbitalKeyRotateSpeedRadPerSec*t,x=this.orbitalKeyRollSpeedRadPerSec*t;if(this.moveKeys.KeyA&&(m-=_),this.moveKeys.KeyD&&(m+=_),this.moveKeys.KeyW&&(u+=_),this.moveKeys.KeyS&&(u-=_),this.moveKeys.KeyQ&&(v+=x),this.moveKeys.KeyE&&(v-=x),(m!==0||u!==0)&&this.camera.nudgeOrbit(m,u),v!==0&&this.camera.nudgeRoll(v),this.moveKeys.Space){const T=Math.exp(-this.orbitalKeyZoomRatePerSec*t);this.camera.nudgeOrbitZoom(T)}if(this.moveKeys.ShiftLeft||this.moveKeys.ShiftRight){const T=Math.exp(this.orbitalKeyZoomRatePerSec*t);this.camera.nudgeOrbitZoom(T)}}if(this.surfaceCamera){const m=this.getFollowBody(this.surfaceBodyIndex);if(m){const u=this.getFollowTargetPosition(this.surfaceBodyIndex);this.camera.setSurfaceTarget({center:u,radius:m.radius,rotationRate:m.rotationRate,axialTilt:m.axialTilt})}}if(this.camera.update(t),this.freeCamera){const m=new w;this.camera.getWorldDirection(m);const u=new w(m.x,0,m.z);u.lengthSq()<1e-6?u.set(0,0,1):u.normalize();const v=new w().crossVectors(u,new w(0,1,0)).normalize(),x=this.freeCamSpeedAuPerSec*Ze*t,T=new w(0,0,0);this.moveKeys.KeyW&&T.add(u),this.moveKeys.KeyS&&T.sub(u),this.moveKeys.KeyD&&T.add(v),this.moveKeys.KeyA&&T.sub(v),this.moveKeys.Space&&(T.y+=1),(this.moveKeys.ShiftLeft||this.moveKeys.ShiftRight)&&(T.y-=1),T.lengthSq()>0&&(T.normalize().multiplyScalar(x),this.camera.moveFree(T.x,T.y,T.z))}else if(this.surfaceCamera){const m=(this.moveKeys.KeyW?1:0)+(this.moveKeys.KeyS?-1:0),u=(this.moveKeys.KeyD?1:0)+(this.moveKeys.KeyA?-1:0),v=(this.moveKeys.Space?1:0)+(this.moveKeys.ShiftLeft||this.moveKeys.ShiftRight?-1:0);(m||u||v)&&this.camera.moveSurface(m,u,v,t,this.surfaceSpeedMps)}const c=this.resolveCameraOrigin(!this.freeCamera&&!this.surfaceCamera),h=performance.now();if(this.bodyRenderer.update(this.state.positions,c,this.camera),this.buildMode&&this.buildPanel.isVisible()){this.camera.setIgnoredButtons([1,2]);const m=this.buildPanel.getParams(),u=m.x-c.x,v=m.y-c.y,_=m.z-c.z;this.bodyRenderer.updateGhostPosition(u,v,_,this.camera.position)}else this.camera.setIgnoredButtons([]),this.bodyRenderer.setGhostVisible(!1);this.bodyRenderer.updateBodies(this.state.time,t);let d=0,f=0;if(this.bodyRenderer.lightSourceManager.forEachSource(m=>{const u=m.position.distanceTo(this.camera.position),v=Math.max(u/Ze,1e-5);d+=m.luminosity/(v*v),f++}),f>0){let m=4/Math.max(d,1e-4);this.currentExperimentalOptions?.earthshineEnabled&&(m*=1.25);const u=Math.min(1e3,Math.max(.6,m)),_=u<this.renderer.toneMappingExposure?.15:2,x=1-Math.exp(-t/_);this.renderer.toneMappingExposure=mo.lerp(this.renderer.toneMappingExposure,u,x)}else{const m=1-Math.exp(-t/2);this.renderer.toneMappingExposure=mo.lerp(this.renderer.toneMappingExposure,4,m)}this.renderer.render(this.scene,this.camera);const p=performance.now();this.frameTiming.render=p-h;const g=performance.now();this.updateUI();const y=performance.now();this.frameTiming.ui=y-g,this.frameTiming.total=performance.now()-e,this.updatePerfMonitor(),this.driftMonitor.update(this.physics,Number(this.state.tick))};updateUI(){const e=performance.now();if(e-this.lastUiDomUpdate<bc)return;this.lastUiDomUpdate=e;const t=this.network.isConnected()?this.currentAdminState?.baseEpoch:ee.adminDefaults.baseEpoch,i=this.formatDate(t||ee.adminDefaults.baseEpoch,this.state.time);if(document.getElementById("sim-time").textContent=i,document.getElementById("time-warp").textContent=`${this.formatTime(this.state.time)} @ ${this.timeController.getDisplayLabel()}`,document.getElementById("sim-bodies").textContent=this.state.bodyCount.toString(),this.cachedBodyMasses&&this.cachedBodyMasses.length>0){let a=0;for(let o=0;o<this.cachedBodyMasses.length;o++)a+=this.cachedBodyMasses[o];document.getElementById("sim-mass").textContent=this.formatMass(a)}else document.getElementById("sim-mass").textContent="0 kg";const n=this.camera.getDistance();document.getElementById("camera-dist").textContent=(n/Ze).toFixed(3)+" AU";const r=this.getReferenceCoords();document.getElementById("sim-x").textContent=(r.x/Ze).toFixed(3)+" AU",document.getElementById("sim-y").textContent=(r.y/Ze).toFixed(3)+" AU",document.getElementById("sim-z").textContent=(r.z/Ze).toFixed(3)+" AU"}getReferenceCoords(){return this.freeCamera?this.camera.getCameraWorldPosition():this.followBodyIndex>=0&&this.followBodyIndex*3+2<this.state.positions.length?{x:this.state.positions[this.followBodyIndex*3],y:this.state.positions[this.followBodyIndex*3+1],z:this.state.positions[this.followBodyIndex*3+2]}:{x:0,y:0,z:0}}updateUIBodyCount(){document.getElementById("sim-bodies").textContent=this.state.bodyCount.toString()}formatTime(e){return e<60?e.toFixed(2)+" s":e<3600?(e/60).toFixed(2)+" min":e<86400?(e/3600).toFixed(2)+" hr":e<31536e3?(e/86400).toFixed(2)+" days":(e/31536e3).toFixed(4)+" years"}formatDate(e,t){const i=new Date(new Date(e).getTime()+t*1e3),n=d=>d.toString().padStart(2,"0"),r=i.getUTCFullYear().toString(),a=n(i.getUTCMonth()+1),o=n(i.getUTCDate()),l=n(i.getUTCHours()),c=n(i.getUTCMinutes()),h=n(i.getUTCSeconds());return`${o}-${a}-${r} ${l}:${c}:${h}`}setLocalSimMode(e){this.localSimMode=e,this.localTickAccumulator=0,this.timeController.resetAccumulator()}formatMass(e){const t=Math.abs(e);return t===0?"0 kg":t<1e6?e.toFixed(2)+" kg":t<1e9?(e/1e6).toFixed(2)+" t":t<1e12?(e/1e9).toFixed(2)+" Mt":t<1e15?(e/1e12).toFixed(2)+" Gt":e.toExponential(3)+" kg"}formatRadius(e){const t=Math.abs(e);return t<1e3?e.toFixed(0)+" m":t<1e6?(e/1e3).toFixed(1)+" km":t<1e9?(e/1e6).toFixed(1)+" Mm":(e/1e9).toFixed(2)+" Gm"}formatBodyType(e){return e.charAt(0).toUpperCase()+e.slice(1)}updateLoadingStatus(e){const t=document.getElementById("loading-status");t&&(t.textContent=e)}hideLoading(){const e=document.getElementById("loading");e&&e.classList.add("hidden")}getPhysics(){return this.physics}getTimeController(){return this.timeController}enableTouchControls(){this.touchControls.enable(),this.applyMobileDefaults()}applyMobileDefaults(){this.showSimulationParams=!1,this.showFollowingDetails=!1,this.updateSimulationSections(),this.hintsVisible=!1;const e=document.getElementById("hints-panel");e&&(e.style.display="none")}disableTouchControls(){this.touchControls.disable()}toggleTouchControls(){this.touchControls.toggle()}isTouchControlsEnabled(){return this.touchControls.isEnabled()}isMobileDevice(){const e="ontouchstart"in window||navigator.maxTouchPoints>0,t=/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);return e&&(t||window.innerWidth<768)}showMobileTouchPrompt(){const e=document.createElement("div");e.id="mobile-prompt",e.innerHTML=`
            <div class="mobile-prompt-overlay">
                <div class="mobile-prompt-content">
                    <h2>Mobile Device Detected</h2>
                    <p>Would you like to enable touch controls?</p>
                    <p class="mobile-prompt-note">Symplectica is designed for desktop and is not yet optimized for phones. For the best experience, use a PC.</p>
                    <div class="mobile-prompt-buttons">
                        <button class="mobile-prompt-btn primary" id="enable-touch">Enable Touch Controls</button>
                        <button class="mobile-prompt-btn secondary" id="dismiss-touch">No Thanks</button>
                    </div>
                </div>
            </div>
        `;const t=document.createElement("style");t.textContent=`
            #mobile-prompt {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1000;
                animation: fadeIn 0.3s ease;
            }

            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            .mobile-prompt-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.75);
                backdrop-filter: blur(8px);
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }

            .mobile-prompt-content {
                background: ${O.surface.panelBg};
                -webkit-backdrop-filter: blur(16px) saturate(180%);
                backdrop-filter: blur(16px) saturate(180%);
                border: 1px solid ${O.surface.cardBorder};
                border-radius: 12px;
                padding: 32px 24px;
                max-width: 480px;
                width: 100%;
                box-shadow: ${O.surface.panelShadow};
                text-align: center;
                color: ${O.text.primary};
                font-family: 'Segoe UI', system-ui, sans-serif;
            }

            .mobile-prompt-content h2 {
                margin: 0 0 16px 0;
                font-size: 24px;
                font-weight: 600;
                color: ${O.accent.primary};
            }

            .mobile-prompt-content p {
                margin: 0 0 16px 0;
                font-size: 16px;
                line-height: 1.5;
                color: ${O.text.secondary};
            }

            .mobile-prompt-note {
                font-size: 13px;
                color: ${O.text.subtle};
                background: ${O.surface.headerBg};
                border: 1px solid ${O.surface.cardBorderSubtle};
                border-radius: 6px;
                padding: 8px 12px;
                margin: 0 0 16px 0;
                line-height: 1.5;
                text-align: left;
            }

            .mobile-prompt-buttons {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .mobile-prompt-btn {
                padding: 10px 20px;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                -webkit-tap-highlight-color: transparent;
                box-sizing: border-box;
            }

            .mobile-prompt-btn.primary {
                background: rgba(79, 195, 247, 0.2);
                border: 1px solid ${O.accent.primaryMuted};
                color: ${O.text.highContrast};
            }

            .mobile-prompt-btn.primary:active, .mobile-prompt-btn.primary:hover {
                background: rgba(79, 195, 247, 0.3);
            }

            .mobile-prompt-btn.secondary {
                background: ${O.surface.buttonBg};
                color: ${O.text.muted};
                border: 1px solid ${O.surface.cardBorder};
            }

            .mobile-prompt-btn.secondary:active, .mobile-prompt-btn.secondary:hover {
                background: ${O.surface.buttonHoverBg};
                color: ${O.text.primary};
            }

            @media (min-width: 500px) {
                .mobile-prompt-buttons {
                    flex-direction: row;
                }
            }
        `,document.head.appendChild(t),document.body.appendChild(e),document.getElementById("enable-touch")?.addEventListener("click",()=>{this.enableTouchControls(),this.chat?.addSystemMessage("Touch controls enabled! Buttons are now visible on screen."),e.remove()}),document.getElementById("dismiss-touch")?.addEventListener("click",()=>{this.chat?.addSystemMessage("Touch controls not enabled. Type /mobile in chat to enable them later."),e.remove()})}onBuildParamsChange(e){if(this.buildMode&&this.buildPanel.isVisible()){this.bodyRenderer.setGhostPreview(e),this.bodyRenderer.setGhostVisible(!0);const t=this.camera.getWorldOrigin(),i=e.x-t.x,n=e.y-t.y,r=e.z-t.z;this.bodyRenderer.updateGhostPosition(i,n,r,this.camera.position)}else this.bodyRenderer.setGhostVisible(!1)}onBuildPanelClose(){this.bodyRenderer.removeGhost()}onGetBodiesForBuildPanel(){return this.physics.getBodies().map(t=>({id:t.id,name:t.name,type:t.type,mass:t.mass,radius:t.radius,color:t.color}))}onDeleteBodyFromBuildPanel(e){if(!this.buildMode){Le.warn("Cannot delete body - not in build mode");return}if(this.physics.removeBody(e)){if(this.refreshBodies(),this.network?.isConnected()){const i=this.physics.getSnapshot();this.network.sendSnapshot(i,"World Builder")}Le.info(`Deleted body id=${e}`)}}onBuildModeRequired(){this.chat?.addSystemMessage("Switch to World Builder mode to use the Build panel (Admin Panel → World Builder).")}onBuildSpawn(e){if(!this.buildMode){Le.warn("Cannot spawn body - not in build mode");return}({star:0,planet:1,moon:2,asteroid:3,comet:4,spacecraft:5})[e.type];const i=r=>[(r>>16&255)/255,(r>>8&255)/255,(r&255)/255],n={id:0,name:e.name,body_type:e.type.charAt(0).toUpperCase()+e.type.slice(1),mass:e.mass,radius:e.radius,color:i(e.color),position:{x:e.x,y:e.y,z:e.z},velocity:{x:e.vx,y:e.vy,z:e.vz},acceleration:{x:0,y:0,z:0},prev_acceleration:{x:0,y:0,z:0},albedo:.3,is_active:!0,parent_id:null,axial_tilt:e.axialTilt,rotation_rate:e.rotationPeriod?2*Math.PI/e.rotationPeriod:0,atmosphere:e.hasAtmosphere?{scale_height:e.atmosphereHeight?e.atmosphereHeight*.085:8500,rayleigh_coefficients:[e.atmosphereRayleighR,e.atmosphereRayleighG,e.atmosphereRayleighB],mie_coefficient:e.atmosphereMieWeight,mie_direction:.758,height:e.atmosphereHeight,mie_color:i(e.atmosphereMieColor??16777215)}:null,contributes_gravity:e.contributesToPhysics,feels_gravity:e.contributesToPhysics,luminosity:(e.luminosity??0)*Zs,effective_temperature:e.effectiveTemperature??0,rings:e.hasRings?{inner_radius_mult:1.11,outer_radius_mult:2.27,texture_preset:"saturn",base_opacity:.8}:null};if(this.physics.simulation.addBodyFromJson(JSON.stringify(n)),this.refreshBodies(),this.network?.isConnected()){const r=this.physics.getSnapshot();this.network.sendSnapshot(r,"World Builder")}Le.info(`Spawned ${e.type}: ${e.name}`)}showError(e){const t=document.getElementById("loading-status"),i=document.querySelector(".spinner");t&&(t.textContent=e,t.classList.add("error")),i&&(i.style.display="none")}}const Zn=new S0;Zn.init().then(()=>{window.physics=Zn.getPhysics(),window.timeController=Zn.getTimeController();const s=Zn;window.__metrics={getSnapshot:()=>({frameMs:s.frameTiming.total,renderMs:s.frameTiming.render,physicsMs:s.frameTiming.physics,uiMs:s.frameTiming.ui,fps:s.fpsHistory.length>0?s.fpsHistory.reduce((e,t)=>e+t,0)/s.fpsHistory.length:0,drawCalls:s.renderer.info.render.calls,triangles:s.renderer.info.render.triangles,geometries:s.renderer.info.memory.geometries,textures:s.renderer.info.memory.textures,heapMB:(performance.memory?.usedJSHeapSize??0)/(1024*1024)||null,bodyCount:s.state.bodyCount,timestamp:performance.now()}),loadPreset:e=>s.loadPresetFromAdmin(e,e,!1)},Le.info("Symplectica client initialized")}).catch(s=>{Le.error("Fatal initialization error:",s),Zn.showError(`Failed to initialize: ${s.message||"Unknown error"}`)});
