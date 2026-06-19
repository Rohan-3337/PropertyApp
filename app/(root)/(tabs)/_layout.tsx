import { useUserStore } from '@/store/useStore';
import { AntDesign } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Icon, Label, NativeTabs, VectorIcon } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  const isAdmin =useUserStore((value)=>value.isAdmin);
  return (
    <NativeTabs backgroundColor={"white"}
    tintColor="#2563eb"
    rippleColor="#2563eb"
    indicatorColor={"#dbeafe"}
    
    >
      <NativeTabs.Trigger name="index">
        <Icon src={<VectorIcon family={MaterialIcons} name="home" />} />
        <Label>Home</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="search">
        <Icon src={<VectorIcon family={MaterialIcons} name="search" />} />
        <Label>Search</Label>
      </NativeTabs.Trigger>

      {!isAdmin &&(
          <NativeTabs.Trigger name="create">
          <Icon src={<VectorIcon family={AntDesign} name="plus-circle"/>} />
          <Label>Add Property</Label>
        </NativeTabs.Trigger>
      )}
    
      <NativeTabs.Trigger name="saved">
        <Icon src={<VectorIcon family={MaterialIcons} name="favorite" />} />
        <Label>Saved</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <Icon src={<VectorIcon family={MaterialIcons} name="person" />} />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}