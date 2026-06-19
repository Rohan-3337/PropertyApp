import FilterModal from '@/components/FilterModal';
import PropertyCard from '@/components/PropertyCard';
import { useFilterStore } from '@/store/filterStore';
import { Property } from '@/types';
import { supabase } from '@/utils/supabase';
import { formatPrice } from '@/utils/utils';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Search = () => {
  const [results,setResults] =useState<Property[]>([]);
  const [loading,setLoading] =useState<boolean>(false);
  const [showfilters,setShowfilters] =useState<boolean>(false);
  const {openFilters} = useLocalSearchParams<{openFilters?:string}>();
  useEffect(()=>{
    if(openFilters ==="true"){
      setShowfilters(true);
    }
  },[openFilters]);
  
  const {search,setSearch,bedrooms,setBedrooms,type,minPrice,maxPrice,setMaxPrice,setMinPrice,setType} = useFilterStore();
  const activeFilterCount = [
  type !== null,
  bedrooms !== null,
  minPrice !== null,
  maxPrice !== null,
].filter(Boolean).length;
  useEffect(() => {
    fetchResults();
  }, [search, type, bedrooms, minPrice, maxPrice]);

  const fetchResults = async () => {
    setLoading(true);

    let query = supabase.from("properties").select("*");

    if (search) {
      query = query.or(`title.ilike.%${search}%,city.ilike.%${search}%`);
    }

    if (type) {
      query = query.eq("type", type);
    }

    if (bedrooms) {
      query = query.eq("bedrooms", bedrooms);
    }

    if (minPrice) {
      query = query.gte("price", minPrice);
    }

    if (maxPrice) {
      query = query.lte("price", maxPrice);
    }

    const { data } = await query.order("created_at", { ascending: false });

    setResults(data ?? []);
    setLoading(false);
  };


  return (
    <SafeAreaView className=' flex-1 bg-gray-50'>

    <View className='px-5 pt-4 pb-3'>
      <Text className=' font-bold text-2xl text-gray-900 mb-4'>Find property</Text>
    </View>

    <View className=' flex-row items-center gap-3 px-2'>
        <View className=' flex-1 flex-row items-center bg-white rounded-2xl px-6 gap-3'
        style={{
          shadowColor:"#000",
          shadowOffset:{width:0,height:1},
          shadowOpacity:0.06,
          shadowRadius:6,
          elevation:2
        }}>
          <Ionicons name='search-outline' size={18} color={"#9CA3AF"}/>
          <TextInput
          className=' flex-1  py-4 text-gray-800'
          placeholder='Search by title or city'
          placeholderTextColor={"#9CA3AF"}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          />

          {search.length>0 &&(
            <TouchableOpacity>
              <Ionicons name='close-circle' size={18} color={"#9CA3AF"} onPress={()=>setSearch("")}/>
            </TouchableOpacity>
          )}

        </View>
        <TouchableOpacity className={` w-12 h-12 rounded-2xl items-center justify-center ${
          activeFilterCount>0 ?"bg-blue-500":"bg-white"
        }`}
         style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.06,
              shadowRadius: 6,
              elevation: 2,
            }}
            
        >
          <Ionicons
          name="options-outline"
          size={20}
          color={activeFilterCount ?"#fff":"#374151"}

          />

           {activeFilterCount > 0 && (
              <View className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full items-center justify-center">
                <Text className="text-white text-[9px] font-bold">
                  {activeFilterCount}
                </Text>
              </View>
            )}
        </TouchableOpacity> 
    </View>


    {activeFilterCount>0 && (
      <View className=' flex-row flex-wrap gap-2 mt-3'>

      {type &&(
        <View className=' flex-row items-center bg-blue-50 border px-3 py-1 gap-2 border-blue-200 rounded-full '>
          <Text className=' text-blue-700 text-xs font-semibold capitalize'>
            {type}
          </Text>

          <TouchableOpacity onPress={()=>setType(null)}>
            <Ionicons name='close' size={10}/>
          </TouchableOpacity>
      </View>
      )}
                  {bedrooms !== null && (
              <View className="flex-row items-center bg-blue-50 border border-blue-200 rounded-full px-3 py-1 gap-1">
                <Ionicons name="bed-outline" size={11} color="#1D4ED8" />
                <Text className="text-blue-700 text-xs font-semibold">
                  {bedrooms === 4
                    ? "4+ beds"
                    : `${bedrooms} bed${bedrooms > 1 ? "s" : ""}`}
                </Text>
                <TouchableOpacity onPress={() => setBedrooms(null)}>
                  <Ionicons name="close" size={12} color="#1D4ED8" />
                </TouchableOpacity>
              </View>
            )}
            {(minPrice !== null || maxPrice !== null) && (
              <View className="flex-row items-center bg-blue-50 border border-blue-200 rounded-full px-3 py-1 gap-1">
                <Text className="text-blue-700 text-xs font-semibold">
                  {minPrice && maxPrice
                    ? `${formatPrice(minPrice)} – ${formatPrice(maxPrice)}`
                    : minPrice
                    ? `From ${formatPrice(minPrice)}`
                    : `Up to ${formatPrice(maxPrice!)}`}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setMinPrice(null);
                    setMaxPrice(null);
                  }}
                >
                  <Ionicons name="close" size={12} color="#1D4ED8" />
                </TouchableOpacity>
              </View>
            )}
      </View>
    )}


        <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <PropertyCard property={item} />}
        ListHeaderComponent={
          <Text className="text-sm text-gray-400 mb-4">
            {loading ? "Searching..." : `${results.length} properties found`}
          </Text>
        }
        ListEmptyComponent={
          !loading ? (
            <View className="items-center py-20">
              <Ionicons name="search-outline" size={48} color="#D1D5DB" />
              <Text className="text-gray-400 mt-4 text-base">
                No properties found
              </Text>
              <Text className="text-gray-300 text-sm mt-1">
                Try a different search or adjust filters
              </Text>
            </View>
          ) : (
            <ActivityIndicator size="large" color="#2563EB" className="py-20" />
          )
        }
      />
    <FilterModal visible={showfilters} onClose={()=>setShowfilters(false)}/>
    </SafeAreaView>
  )
}

export default Search