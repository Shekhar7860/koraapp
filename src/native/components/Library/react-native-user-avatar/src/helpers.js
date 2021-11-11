import initials from 'initials';

export const abbr = (name = 'User') => {
  let abbr = initials(name);
  if (!name) {
    //    console.log('NAME IS NULL', name);
    name = 'User';
  }
  if (name.startsWith('+')) {
    abbr = `+${abbr}`;
  }
  if (!abbr) {
    //console.log('Could not get abbr from name');
    abbr = name;
  }
  return abbr;
};

export const sumChars = (str) => {
  let sum = 0;
  if (!str?.length) {
    //    console.log('STR should be of type string, instead found', str);
    return 1;
  }
  for (let i = 0; i < str?.length; i++) {
    sum += str.charCodeAt(i);
  }

  return sum;
};

export const fetchImage = async (src) => {
  try {
    const fetchCall = await fetch(src);
    if (fetchCall.headers.map['content-type'].startsWith('image/')) {
      return true;
    } else {
      console.log('Online fetched source is not a supported image');
      return false;
    }
  } catch (err) {
    console.log('Error fetching source, falling back to initials', err);
    return false;
  }
};

export const generateBackgroundStyle = (name, color, colors) => {
  let background;
  if (color) {
    background = color.bgColor;
  } else {
    // Pick a deterministic color from the list
    const i = sumChars(name) % colors.length;
    background = colors[i].bgColor;
  }
  return {backgroundColor: background};
};

export const getColor = (name, colors) => {
  const i = sumChars(name) % colors.length;
  return colors[i];
};

export const getContainerStyle = (size, src, borderRadius) => {
  const _borderRadius = borderRadius ? {borderRadius: borderRadius} : {};
  return {
    // borderWidth: src ? 0 : 1,
    ..._borderRadius,
    borderWidth: 1,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  };
};
