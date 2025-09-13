import * as React from 'react';
import renderer from 'react-test-renderer';

import { PretendardText } from '../StyledText';

it(`renders correctly`, () => {
  const tree = renderer.create(<PretendardText>Snapshot test!</PretendardText>).toJSON();

  expect(tree).toMatchSnapshot();
});
