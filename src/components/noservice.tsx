import React, { FC, useMemo } from 'react';
import { Box, Button, useNavigate } from 'zmp-ui';
import imgNoService from '../static/logo.png';
const NoService: FC = () => {
  const navigate = useNavigate();
  return (
    <>
      <Box style={{ marginTop: '45%', textAlign: 'center' }}>
        <Box style={{ marginTop: '50px', textAlign: 'center' }}>
          <img
            src={imgNoService}
            style={{
              margin: 'auto',
              width: '80%',
              maxWidth: '250px',
            }}
          />
        </Box>
        <Box
          style={{
            alignSelf: 'normal',
            fontSize: '1.2em',
            marginBottom: '0.5em',
            marginTop: '0.5em',
            color: '#be185d',
            fontWeight: 'bold',
            textAlign: 'center',
          }}>
          <p>
            Đăng nhập không thành công.
            <br />
            Vui lòng kiểm tra lại
          </p>
        </Box>
      </Box>
    </>
  );
};

export default NoService;
