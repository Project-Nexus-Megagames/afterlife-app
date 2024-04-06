import React, { useEffect } from "react";
import {
  useDisclosure,
  Button,
  IconButton,
  Input,
  Box,
  VStack,
  Divider,
  Text,
  Center
} from '@chakra-ui/react'
import { BsPlus } from "react-icons/bs";
import AssetCard from "./AssetCard";
import { CandiModal } from "./CandiModal";
import { populateThisAccount } from "../../scripts/frontend";
import { useSelector } from "react-redux";

export const AddAsset = ({ open, handleSelect, onClose, onOpen, assets, disabled }) => {
  const { isOpen, onOpen: OpenModal, onClose: CloseModal } = useDisclosure();
  const [fill, setFilter] = React.useState('');
  const accounts = useSelector(state => state.accounts.list);

  const uniqueAccountIds = new Set();
  assets.forEach(asset => {
    uniqueAccountIds.add(asset.account);
  });
  // Convert the Set to an array
  const uniqueAccountIdsArray = Array.from(uniqueAccountIds).map(acc => { return populateThisAccount(accounts, acc) });
  const [selectedAccount, setSelectedAccount] = React.useState(uniqueAccountIdsArray ? uniqueAccountIdsArray[0] : false);

  const handleClose = () => {
    if (onClose && onClose instanceof Function) onClose();
    CloseModal();
  };

  const handleOpen = () => {
    if (onOpen && onOpen instanceof Function) onOpen();
    OpenModal();
  }

  useEffect(() => {
    if (open) handleOpen();
    else handleClose();
  }, [open]);

  let filteredAssets = assets.filter(a => a.name.toLowerCase().includes(fill.toLowerCase()));
  if (uniqueAccountIdsArray && selectedAccount) filteredAssets = filteredAssets.filter(a => a.account === selectedAccount?._id);

  return (
    <>
      <Center className="styleCenter"  >
        <IconButton onClick={() => handleOpen()} isDisabled={disabled || assets.length <= 0} variant="solid" colorScheme='green' size="sm" icon={<BsPlus size={'25'} />} />
        {assets.length <= 0 && <Text color='red' >No Assets</Text>}
      </Center>
      <CandiModal open={isOpen} onClose={() => handleClose()}  >

        <Input style={{ width: '94%' }} value={fill} onChange={(e) => setFilter(e.target.value)} placeholder={`${assets.length} Assets`} />
        {uniqueAccountIdsArray && uniqueAccountIdsArray.length > 1 && uniqueAccountIdsArray.map(account => (
          <Button
            onClick={() => setSelectedAccount(account)}
            variant={selectedAccount?._id === account._id ? 'solid' : 'ghost'}
            key={account?._id}
            colorScheme={selectedAccount?._id === account._id ? 'green' : 'teal'}
          >
            {account?.name}
          </Button>
        ))}
        <Divider />
        <VStack divider={<Divider />} style={{ overflow: 'scroll', }} justify="space-around" align={'center'}  >
          {filteredAssets.map((ass) => (
            <Box key={ass._id} style={{ width: '100%', cursor: 'pointer' }}>
              <AssetCard handleSelect={() => { handleSelect(ass); CloseModal(); }} asset={ass} />
            </Box>
          ))}
        </VStack>
      </CandiModal>
    </>
  );
};