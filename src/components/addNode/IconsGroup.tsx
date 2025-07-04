import React from "react";

import { getDataGroup } from "@src/services/index";
import { tableNameDB } from "@src/context/index";
import { OptionTechniqueCard } from "@src/context/index";

import themeApp from "@src/styles/stylesThemeApp";
const theme = themeApp;

interface IconProps extends React.SVGProps<SVGSVGElement> {
  color: string;
}
export const GuardIcon: React.FC<IconProps> = ({ color }) => {
  return (
    <div style={{ marginRight: "8px" }}>
      <svg
        version="1.0"
        xmlns="http://www.w3.org/2000/svg"
        width="18pt"
        height="18pt"
        viewBox="0 0 186.000000 186.000000"
        preserveAspectRatio="xMidYMid meet"
      >
        <g
          transform="translate(0.000000,186.000000) scale(0.100000,-0.100000)"
          fill={color}
          stroke="none"
        >
          <path
            d="M715 1714 c-100 -24 -228 -84 -315 -149 -105 -78 -222 -227 -273
        -350 -74 -177 -76 -448 -5 -615 28 -64 55 -90 95 -90 29 0 36 5 48 34 13 30
        13 48 -1 138 -52 346 120 655 462 826 78 39 114 81 114 131 0 24 -7 44 -19 55
        -20 18 -72 28 -106 20z"
          />
          <path
            d="M1034 1696 c-21 -17 -28 -33 -28 -60 0 -47 36 -84 128 -132 243 -125
        399 -330 442 -579 16 -87 15 -136 -2 -302 -8 -76 10 -113 55 -113 40 0 74 37
        101 106 92 244 48 565 -105 770 -123 163 -304 289 -463 323 -76 16 -98 14
        -128 -13z"
          />
          <path
            d="M850 1359 c-266 -30 -470 -256 -470 -522 0 -164 80 -326 197 -398 69
        -43 164 -15 198 57 27 57 15 97 -49 164 -63 65 -81 116 -73 198 11 102 86 187
        196 219 61 17 144 12 192 -12 89 -46 149 -140 149 -233 0 -69 -20 -115 -79
        -177 -57 -61 -66 -81 -52 -132 13 -46 18 -52 55 -81 42 -32 102 -30 152 6 124
        90 194 231 194 392 0 319 -278 556 -610 519z"
          />
          <path
            d="M334 398 c-11 -17 48 -120 100 -172 28 -29 78 -66 111 -82 l60 -29
        325 0 325 0 55 27 c69 34 153 116 186 179 20 40 32 89 21 89 -1 0 -34 -7 -72
        -15 -96 -20 -934 -21 -1038 -1 -39 7 -70 9 -73 4z"
          />
        </g>
      </svg>
    </div>
  );
};

export const ControlIcon: React.FC<IconProps> = ({ color }) => {
  return (
    <div style={{ marginRight: "8px" }}>
      <svg
        version="1.0"
        xmlns="http://www.w3.org/2000/svg"
        width="18pt"
        height="18pt"
        viewBox="0 0 200.000000 190.000000"
        preserveAspectRatio="xMidYMid meet"
      >
        <g
          transform="translate(0.000000,190.000000) scale(0.100000,-0.100000)"
          fill={color}
          stroke="none"
        >
          <path
            d="M895 1830 c-354 -38 -659 -290 -768 -635 -30 -96 -50 -243 -45 -340
l3 -70 150 0 150 0 -5 30 c-3 17 -5 71 -4 120 0 163 60 302 179 420 115 114
249 172 416 182 253 15 481 -115 596 -340 49 -96 65 -177 61 -306 l-3 -111
148 0 147 0 0 119 c0 201 -37 342 -129 494 -151 249 -387 401 -681 437 -92 11
-110 11 -215 0z"
          />
          <path
            d="M878 972 c-57 -38 -361 -347 -356 -362 2 -5 113 -120 248 -255 l244
-245 243 242 c134 134 243 247 243 251 0 24 -376 395 -387 383 -2 -2 7 -21 22
-41 21 -33 25 -49 25 -116 0 -103 -27 -175 -89 -240 -26 -27 -53 -49 -59 -49
-23 0 -92 73 -117 124 -52 106 -51 243 2 298 30 32 21 37 -19 10z"
          />
          <path
            d="M90 266 c0 -91 1 -166 3 -166 1 0 174 -3 384 -7 338 -5 383 -4 383 9
0 9 -67 85 -149 169 l-148 154 -237 4 -236 3 0 -166z"
          />
          <path
            d="M1325 265 c-82 -84 -151 -158 -153 -164 -2 -7 113 -10 370 -8 l373 2
3 163 2 162 -222 0 -223 -1 -150 -154z"
          />
        </g>
      </svg>
    </div>
  );
};
export const PassIcon: React.FC<IconProps> = ({ color }) => {
  return (
    <div style={{ marginRight: "8px" }}>
      <svg
        version="1.0"
        xmlns="http://www.w3.org/2000/svg"
        width="18pt"
        height="18pt"
        viewBox="0 0 231.000000 186.000000"
        preserveAspectRatio="xMidYMid meet"
      >
        <g
          transform="translate(0.000000,186.000000) scale(0.100000,-0.100000)"
          fill={color}
          stroke="none"
        >
          <path
            d="M245 1721 c-11 -5 -33 -23 -50 -41 l-30 -31 -3 -705 c-2 -624 -1
-708 13 -735 37 -70 137 -91 196 -42 61 51 59 29 59 760 0 409 -4 682 -10 704
-15 52 -59 91 -112 95 -24 2 -52 0 -63 -5z"
          />
          <path
            d="M1959 1707 c-67 -45 -64 -10 -64 -772 0 -645 1 -692 18 -723 50 -92
181 -96 232 -8 18 29 19 69 16 735 -2 698 -2 705 -23 734 -41 57 -122 73 -179
34z"
          />
          <path
            d="M625 1514 c-64 -33 -114 -105 -115 -164 0 -71 49 -154 111 -186 15
-7 55 -14 88 -14 52 0 65 4 103 33 51 38 88 106 88 160 0 67 -53 147 -116 173
-44 19 -122 18 -159 -2z"
          />
          <path
            d="M1040 1222 l0 -297 29 -60 c34 -71 76 -113 151 -152 55 -28 56 -28
277 -31 247 -4 266 0 303 61 37 61 17 143 -46 184 -24 15 -52 18 -214 18 -143
0 -191 3 -203 14 -25 20 -37 76 -37 169 l0 82 203 0 c227 0 252 6 294 69 42
62 19 147 -48 183 -30 16 -62 18 -329 18 -270 0 -299 2 -337 20 l-43 19 0
-297z"
          />
          <path
            d="M551 914 c-66 -56 -63 -162 7 -209 l37 -25 280 0 c249 1 278 2 260
15 -54 40 -100 97 -133 167 l-37 77 -192 0 -191 1 -31 -26z"
          />
        </g>
      </svg>
    </div>
  );
};
export const SubmissionIcon: React.FC<IconProps> = ({ color }) => {
  return (
    <div style={{ marginRight: "8px" }}>
      <svg
        version="1.0"
        xmlns="http://www.w3.org/2000/svg"
        width="18pt"
        height="18pt"
        viewBox="0 0 229.000000 167.000000"
        preserveAspectRatio="xMidYMid meet"
      >
        <g
          transform="translate(0.000000,167.000000) scale(0.100000,-0.100000)"
          fill={color}
          stroke="none"
        >
          <path
            d="M135 1516 c-17 -7 -43 -28 -58 -45 -33 -40 -36 -101 -7 -148 39 -64
31 -63 544 -63 l465 0 28 -24 28 -24 5 -252 5 -252 37 -34 c31 -28 45 -34 83
-34 55 0 95 19 121 57 17 25 19 52 22 258 2 147 -1 252 -8 290 -23 117 -90
202 -199 254 l-56 26 -490 2 c-395 2 -496 0 -520 -11z"
          />
          <path
            d="M651 1133 c-74 -39 -90 -89 -80 -258 10 -182 65 -308 194 -440 76
-78 175 -142 269 -175 103 -35 178 -42 381 -34 l190 7 38 37 c33 34 37 43 37
90 0 47 -4 56 -39 91 l-39 39 -173 0 c-201 0 -272 9 -346 46 -81 39 -167 124
-205 201 -29 60 -32 76 -38 192 -4 97 -9 133 -23 154 -38 59 -109 80 -166 50z"
          />
          <path
            d="M1875 515 c-72 -39 -108 -94 -108 -170 -1 -143 148 -238 272 -173
103 53 139 159 87 255 -37 67 -83 96 -160 101 -43 2 -70 -2 -91 -13z"
          />
        </g>
      </svg>
    </div>
  );
};
export const SwitchIcon: React.FC<IconProps> = ({ color }) => {
  return (
    <div style={{ marginRight: "8px" }}>
      <svg
        version="1.0"
        xmlns="http://www.w3.org/2000/svg"
        width="18pt"
        height="18pt"
        viewBox="0 0 159.000000 213.000000"
        preserveAspectRatio="xMidYMid meet"
      >
        <g
          transform="translate(0.000000,213.000000) scale(0.100000,-0.100000)"
          fill={color}
          stroke="none"
        >
          <path
            d="M787 1922 c-3 -4 -3 -69 0 -144 l6 -136 55 -68 c179 -223 305 -472
358 -709 24 -107 30 -372 10 -464 -17 -82 -60 -182 -102 -236 -35 -46 -16 -46
62 0 124 73 236 241 270 405 22 101 21 291 0 403 -37 191 -133 392 -275 572
-102 131 -373 396 -384 377z"
          />
          <path
            d="M400 1920 c0 -3 -2 -309 -3 -680 -3 -732 -2 -711 -60 -826 -36 -72
-97 -145 -169 -205 -35 -28 -64 -56 -66 -60 -2 -5 187 -9 421 -9 l424 0 46 49
c107 115 150 274 127 481 -42 391 -238 765 -587 1120 -73 74 -133 133 -133
130z"
          />
        </g>
      </svg>
    </div>
  );
};
export const TachiWazaIcon: React.FC<IconProps> = ({ color }) => {
  return (
    <div style={{ marginRight: "8px" }}>
      <svg
        version="1.0"
        xmlns="http://www.w3.org/2000/svg"
        width="18pt"
        height="18pt"
        viewBox="0 0 229.000000 197.000000"
        preserveAspectRatio="xMidYMid meet"
      >
        <g
          transform="translate(0.000000,197.000000) scale(0.100000,-0.100000)"
          fill={color}
          stroke="none"
        >
          <path
            d="M980 1837 c-193 -58 -349 -187 -434 -357 -154 -312 -64 -681 214
-873 51 -36 194 -97 226 -97 20 0 22 6 26 93 3 50 3 100 0 110 -3 10 -31 30
-66 46 -85 39 -140 90 -176 164 -96 197 -47 451 112 578 100 79 214 112 343
100 51 -5 67 -3 110 19 71 36 184 40 267 10 33 -12 63 -19 66 -15 4 4 -25 37
-63 73 -79 75 -185 133 -287 157 -95 22 -247 19 -338 -8z"
          />
          <path
            d="M1398 1540 c-77 -41 -119 -133 -97 -213 46 -175 285 -199 367 -37 24
49 27 77 12 132 -32 113 -176 173 -282 118z"
          />
          <path
            d="M1945 1411 c-51 -23 -101 -79 -116 -132 -25 -81 24 -180 112 -227 90
-48 207 -8 257 88 34 66 28 154 -14 207 -60 76 -157 102 -239 64z"
          />
          <path
            d="M1695 1219 c-22 -22 -79 -70 -126 -105 -47 -36 -93 -78 -102 -94 -33
-55 -18 -128 37 -179 20 -19 40 -26 84 -29 55 -4 59 -2 117 41 33 25 82 68
109 96 l49 50 -31 36 c-46 52 -73 110 -79 171 -3 30 -9 54 -12 54 -4 0 -25
-18 -46 -41z"
          />
          <path
            d="M830 1092 c-25 -26 -30 -38 -30 -79 0 -87 59 -150 200 -212 l85 -38
5 -274 c4 -192 9 -281 17 -296 24 -41 63 -63 112 -63 58 0 89 16 118 59 23 34
23 36 23 397 l0 362 -102 40 c-186 73 -329 123 -363 129 -29 5 -39 0 -65 -25z"
          />
          <path
            d="M235 590 c-125 -29 -195 -149 -150 -258 42 -100 160 -150 258 -109
45 19 105 89 113 132 26 139 -92 265 -221 235z"
          />
        </g>
      </svg>
    </div>
  );
};
export const TransitionIcon: React.FC<IconProps> = ({ color }) => {
  return (
    <div style={{ marginRight: "8px" }}>
      <svg
        version="1.0"
        xmlns="http://www.w3.org/2000/svg"
        width="18pt"
        height="18pt"
        viewBox="0 0 208.000000 183.000000"
        preserveAspectRatio="xMidYMid meet"
      >
        <g
          transform="translate(0.000000,183.000000) scale(0.100000,-0.100000)"
          fill={color}
          stroke="none"
        >
          <path
            d="M835 1693 c-275 -38 -538 -249 -645 -516 -54 -134 -64 -190 -64 -337
0 -109 4 -151 22 -218 22 -80 68 -184 111 -246 40 -59 143 -154 199 -184 67
-36 191 -72 242 -71 34 0 34 1 10 11 -178 76 -274 182 -337 373 -24 72 -27 95
-27 225 0 133 2 152 28 225 71 208 220 366 414 443 59 23 82 26 187 27 112 0
124 -2 178 -29 69 -33 104 -77 143 -177 37 -93 87 -148 178 -195 57 -30 81
-49 107 -87 67 -98 130 -133 225 -125 95 8 175 81 196 179 18 92 -17 175 -100
233 -38 27 -53 31 -142 36 -93 6 -102 8 -130 35 -17 16 -43 52 -59 80 -84 147
-244 262 -424 305 -78 19 -225 25 -312 13z"
          />
          <path
            d="M959 1236 c-177 -74 -319 -231 -364 -403 -31 -119 -14 -283 41 -383
87 -160 224 -254 389 -266 l60 -4 -41 13 c-131 44 -262 202 -295 357 -46 215
88 434 300 491 48 13 74 26 94 49 43 49 32 115 -25 150 -43 26 -90 25 -159 -4z"
          />
        </g>
      </svg>
    </div>
  );
};

const iconMap: Record<string, React.JSX.Element> = {
  submission: <SubmissionIcon color={theme.palette.text.secondary} />,
  takedown: <TachiWazaIcon color={theme.palette.text.secondary} />,
  guard_pass: <PassIcon color={theme.palette.text.secondary} />,
  defense_escape: <TransitionIcon color={theme.palette.text.secondary} />,
  guard: <GuardIcon color={theme.palette.text.secondary} />,
  control: <ControlIcon color={theme.palette.text.secondary} />,
  switch: <SwitchIcon color={theme.palette.text.secondary} />,
};
export let optionsMenu: OptionTechniqueCard[] = [];

(async () => {
  const groups = await getDataGroup(tableNameDB.group);

  optionsMenu = (groups ?? []).map(
    (item: any) => ({
      value: item.label,
      label: item.title,
      icon: iconMap[item.label] || null, // Previene errores si no hay ícono
    })
  );
})();