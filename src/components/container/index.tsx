import React from 'react';
import classes from './container.module.scss';

interface ContainerProps {
  children: React.ReactNode;
}

export const Container: React.FC<ContainerProps> = ({ children }) => {
  return (
    <div className={classes.container}>
      {children}
    </div>
  );
};