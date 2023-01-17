import React from 'react';
import cn from 'classnames';

type Props = {
  onClick: () => void;
  isActive: boolean;
  isReversed: boolean;
};

export const SortLink:React.FC<Props> = ({
  onClick,
  isActive,
  isReversed,
}) => {
  return (
    <a
      href="#/"
      onClick={onClick}
    >
      <span className="icon">
        <i
          data-cy="SortIcon"
          className={cn('fas', {
            'fa-sort': !isActive,
            'fa-sort-up': isActive && !isReversed,
            'fa-sort-down': isActive && isReversed,

          })}
        />
      </span>
    </a>
  );
};
